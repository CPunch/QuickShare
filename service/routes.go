package service

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"github.com/go-chi/chi/v5"
)

func (server *Service) uploadEndpointHandler() http.HandlerFunc {
	storage := server.ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	if storage == nil {
		log.Fatal("[service/uploadEndpointHandler]: no storage instance attached to context!")
	}

	db := server.ctx.Value(config.CONTEXT_DB).(*sql.DBHandler)
	if db == nil {
		log.Fatal("[service/uploadEndpointHandler]: no db instance attached to context!")
	}

	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(5 * 1024 * 1024) // keep up to 5mb of the file in memory, dump the rest to disk
		if err != nil {
			http.Error(w, "Failed to parse MultipartForm!", http.StatusBadRequest)
			return
		}

		// grab form data
		token := r.FormValue("token")
		if tkn, err := db.GetTokenById(token); err != nil || tkn == nil {
			log.Println(token)
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		expire := r.FormValue("expire")
		expireTime, err := time.ParseDuration(expire)
		if err != nil {
			http.Error(w, "Failed to parse time duration!", http.StatusBadRequest)
			return
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Failed to get file from request!", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// craft response
		storedFile, err := storage.AcceptFile(header, file)
		if err != nil {
			http.Error(w, "Failed to store file!", http.StatusInternalServerError)
			log.Fatal("[service/uploadEndpointHandler]: StorageHandler error ", err)
		}

		storedFile, err = db.InsertFile(token, storedFile.Name, storedFile.Sha256, storedFile.Mime, expireTime)
		if err != nil {
			http.Error(w, "Failed to insert file into the database!", http.StatusInternalServerError)
			log.Fatal("[service/uploadEndpointHandler]: SQL Error ", err)
		}

		log.Printf("New file uploaded! file hash: %s id: %s mime: %s\n", storedFile.Sha256, storedFile.ID, storedFile.Mime)

		// respond with new file info
		json.NewEncoder(w).Encode(storedFile)
	}
}

func (server *Service) rawEndpointHandler() http.HandlerFunc {
	storage := server.ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	if storage == nil {
		log.Fatal("[service/rawEndpointHandler]: no storage instance attached to context!")
	}

	db := server.ctx.Value(config.CONTEXT_DB).(*sql.DBHandler)
	if db == nil {
		log.Fatal("[service/rawEndpointHandler]: no db instance attached to context!")
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// grab param
		id := chi.URLParam(r, "id")
		if id == "" {
			http.Error(w, "Expected file id!", http.StatusBadRequest)
			return
		}

		// craft response
		file, err := db.GetFileById(id)
		if err != nil {
			http.Error(w, "File ID doesn't exist!", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Disposition", fmt.Sprintf(": attachment; filename=\"%s\"", file.Name))
		if err = storage.SendFile(file.Sha256, w); err != nil {
			http.Error(w, "Unexpected error occurred, please try again!", http.StatusInternalServerError)
			log.Fatal("[service/rawEndpointHandler]: Failed sending file! ", err)
		}
	}
}
