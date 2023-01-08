package service

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

//go:embed app/dist
var clientFS embed.FS

func (server *Service) staticClientHandler() http.Handler {
	// "/index.html" now becomes "/app/dist/index.html"
	app, err := fs.Sub(clientFS, "app/dist")
	if err != nil {
		log.Fatal(err)
	}

	return http.FileServer(http.FS(app))
}

func (server *Service) rawEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// grab param
		id := chi.URLParam(r, "id")
		if id == "" {
			http.Error(w, "Expected file id!", http.StatusBadRequest)
			return
		}

		// craft response
		file, err := server.db.GetFileById(id)
		if err != nil {
			http.Error(w, "File ID doesn't exist!", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Disposition", fmt.Sprintf(": attachment; filename=\"%s\"", file.Name))
		if err = server.storage.SendFile(file.Sha256, w); err != nil {
			http.Error(w, "Unexpected error occurred, please try again!", http.StatusInternalServerError)
			log.Fatal("[service/rawEndpointHandler]: Failed sending file! ", err)
		}
	}
}

// ========================== API handlers

func (server *Service) uploadEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(5 * 1024 * 1024) // keep up to 5mb of the file in memory, dump the rest to disk
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to parse MultipartForm: %v", err), http.StatusBadRequest)
			return
		}

		// grab form data
		token := r.FormValue("token")
		if tkn, err := server.db.GetTokenById(token); err != nil || tkn == nil {
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
		storedFile, err := server.storage.AcceptFile(header, file)
		if err != nil {
			http.Error(w, "Failed to store file!", http.StatusInternalServerError)
			log.Fatal("[service/uploadEndpointHandler]: StorageHandler error ", err)
		}

		storedFile, err = server.db.InsertFile(token, storedFile.Name, storedFile.Sha256, storedFile.Mime, storedFile.Size, expireTime)
		if err != nil {
			http.Error(w, "Failed to insert file into the database!", http.StatusInternalServerError)
			log.Fatal("[service/uploadEndpointHandler]: SQL Error ", err)
		}

		log.Printf("New file uploaded! file hash: %s id: %s mime: %s\n", storedFile.Sha256, storedFile.ID, storedFile.Mime)

		// respond with new file info
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(storedFile)
	}
}

func (server *Service) verifyTokenEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(5 * 1024 * 1024) // keep up to 5mb of the file in memory, dump the rest to disk
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to parse MultipartForm: %v", err), http.StatusBadRequest)
			return
		}

		// grab form data
		token := r.FormValue("token")
		tkn, err := server.db.GetTokenById(token)
		if err != nil || tkn == nil {
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		// respond with token info
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tkn)
	}
}
