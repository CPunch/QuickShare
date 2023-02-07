package service

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"time"

	"github.com/CPunch/QuickShare/util"
	"github.com/go-chi/chi/v5"
)

//go:embed app/dist
var clientFS embed.FS

func parseForm(w http.ResponseWriter, r *http.Request, maxSize, maxUsage int64) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxSize) // accept request bodies up to maxSize
	err := r.ParseMultipartForm(maxUsage)            // keep up to maxUsage of the file in memory, dump the rest to disk
	if err != nil {
		return fmt.Errorf("Failed to parse MultipartForm: %v", err)
	}

	return nil
}

func jsonResponse(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

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

		if err = server.storage.SendFile(file, w); err != nil {
			http.Error(w, "Unexpected error occurred, please try again!", http.StatusInternalServerError)
			log.Fatal("[service/rawEndpointHandler]: Failed sending file! ", err)
		}
	}
}

// ========================== API handlers

func (server *Service) uploadEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: max request body size should definitely be user definable. not sure about the file memory usage
		if err := parseForm(w, r, 1*1024*1024*1024, 5*1024*1024); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
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
		jsonResponse(w, storedFile)
	}
}

func (server *Service) deleteEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := parseForm(w, r, 1*1024*1024, 1*1024*1024); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}

		// grab form data
		token := r.FormValue("token")
		tkn, err := server.db.GetTokenById(token)
		if err != nil || tkn == nil {
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		id := r.FormValue("id")
		file, err := server.db.GetFileById(id)
		if err != nil || file == nil {
			http.Error(w, "Unknown file ID!", http.StatusNotFound)
			return
		}

		// verify token owns this file
		if file.TokenID != token {
			http.Error(w, "You don't own this file!", http.StatusUnauthorized)
			return
		}

		// delete file
		if err := util.RemoveFile(server.storage, server.db, file); err != nil {
			http.Error(w, fmt.Sprintf("Failed to delete file: %v!", err), http.StatusInternalServerError)
			return
		}

		log.Print("Successfully removed ", file.ID)
	}
}

func (server *Service) verifyTokenEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := parseForm(w, r, 1*1024*1024, 1*1024*1024); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}

		// grab form data
		token := r.FormValue("token")
		tkn, err := server.db.GetTokenById(token)
		if err != nil || tkn == nil {
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		// respond with token info
		jsonResponse(w, tkn)
	}
}

func (server *Service) fileListEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := parseForm(w, r, 1*1024*1024, 1*1024*1024); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}

		// grab form data
		token := r.FormValue("token")
		tkn, err := server.db.GetTokenById(token)
		if err != nil || tkn == nil {
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		files, err := server.db.GetFilesByToken(token)

		// respond with file list
		jsonResponse(w, files)
	}
}
