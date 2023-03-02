package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path"
	"time"

	"github.com/CPunch/QuickShare/api/db"
	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/config"
	"github.com/CPunch/QuickShare/util"
	"github.com/go-chi/chi/v5"
)

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

func (server *Service) authenticateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Missing token auth cookie!", http.StatusUnauthorized)
			return
		}

		tkn, err := db.GetTokenById(server.dbHndlr, token.Value)
		if err != nil || tkn == nil {
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(server.ctx, config.CONTEXT_TOKEN, tkn)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ========================== Unauthenticated handlers

func (server *Service) staticClientHandler() http.HandlerFunc {
	fileSys := http.FS(server.app)
	fileServe := http.FileServer(fileSys)
	return func(w http.ResponseWriter, r *http.Request) {
		// forward all 404s to the index.html
		if _, err := fileSys.Open(path.Clean(r.URL.Path)); err != nil {
			http.StripPrefix(r.URL.Path, fileServe).ServeHTTP(w, r)
		} else {
			fileServe.ServeHTTP(w, r)
		}
	}
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
		file, err := db.GetFileById(server.dbHndlr, id)
		if err != nil {
			http.Error(w, "File ID doesn't exist!", http.StatusNotFound)
			return
		}

		if err = server.storage.SendFile(file, w); err != nil {
			http.Error(w, "Unexpected error occurred, please try again!", http.StatusInternalServerError)
			log.Print("[service/rawEndpointHandler]: Failed sending file! ", err)
		}
	}
}

func (server *Service) infoEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing id!", http.StatusBadRequest)
			return
		}

		// grab file data
		file, err := db.GetFileById(server.dbHndlr, id)
		if err != nil || file == nil {
			http.Error(w, "Unknown file ID!", http.StatusNotFound)
			return
		}

		// respond with file list
		jsonResponse(w, file)
	}
}

// ========================== Authenticated handlers

func (server *Service) verifyTokenEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := parseForm(w, r, 5*1024*1024, 5*1024*1024); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		token := r.FormValue("token")
		if token == "" {
			http.Error(w, "Missing token!", http.StatusBadRequest)
			return
		}

		tkn, err := db.GetTokenById(server.dbHndlr, token)
		if err != nil || tkn == nil {
			http.Error(w, "Unauthorized token!", http.StatusUnauthorized)
			return
		}

		// we set a cookie named 'token' which will be grabbed and verified by the authenticateToken middleware
		http.SetCookie(w, &http.Cookie{Name: "token", Value: token, SameSite: http.SameSiteStrictMode})

		// respond with token info
		jsonResponse(w, tkn)
	}
}

func (server *Service) fileListEndpointHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tkn, ok := r.Context().Value(config.CONTEXT_TOKEN).(*iface.Token)
		if !ok {
			http.Error(w, "Failed to grab token in route handler", http.StatusInternalServerError)
			return
		}

		files, err := db.GetFilesByToken(server.dbHndlr, tkn.ID)
		if err != nil {
			http.Error(w, "Failed to grab files", http.StatusInternalServerError)
			return
		}

		// respond with file list
		jsonResponse(w, files)
	}
}

func (server *Service) uploadEndpointHandler() http.HandlerFunc {
	maxUploadSize := server.ctx.Value(config.CONTEXT_MAXUPLOADSIZE).(int64)
	return func(w http.ResponseWriter, r *http.Request) {
		tkn, ok := r.Context().Value(config.CONTEXT_TOKEN).(*iface.Token)
		if !ok {
			http.Error(w, "Failed to grab token in route handler", http.StatusInternalServerError)
			return
		}

		if err := parseForm(w, r, maxUploadSize*1024*1024, 5*1024*1024); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// grab form data
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

		storedFile, err = db.InsertFile(server.dbHndlr, tkn.ID, storedFile.Name, storedFile.Sha256, storedFile.Mime, storedFile.Size, expireTime)
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
		tkn, ok := r.Context().Value(config.CONTEXT_TOKEN).(*iface.Token)
		if !ok {
			http.Error(w, "Failed to grab token in route handler", http.StatusInternalServerError)
			return
		}

		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "Missing id!", http.StatusBadRequest)
			return
		}

		file, err := db.GetFileById(server.dbHndlr, id)
		if err != nil || file == nil {
			http.Error(w, "Unknown file ID!", http.StatusNotFound)
			return
		}

		// verify token owns this file
		if file.TokenID != tkn.ID {
			http.Error(w, "You don't own this file!", http.StatusUnauthorized)
			return
		}

		// delete file
		if err := util.RemoveFile(server.storage, server.dbHndlr, file); err != nil {
			http.Error(w, fmt.Sprintf("Failed to delete file: %v!", err), http.StatusInternalServerError)
			return
		}

		log.Print("Successfully removed ", file.ID)
	}
}
