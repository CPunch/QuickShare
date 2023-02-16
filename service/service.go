package service

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"github.com/CPunch/QuickShare/service/jobs"
	"github.com/go-chi/chi/v5"
)

//go:embed app/dist
var clientFS embed.FS

type Service struct {
	mux     *chi.Mux
	app     fs.FS
	storage storage.StorageHandler
	db      *sql.DBHandler
	ctx     context.Context
}

func NewService(ctx context.Context) *Service {
	storage := ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	if storage == nil {
		log.Fatal("[service/NewService]: no storage instance attached to context!")
	}

	db := ctx.Value(config.CONTEXT_DB).(*sql.DBHandler)
	if db == nil {
		log.Fatal("[service/NewService]: no db instance attached to context!")
	}

	service := &Service{mux: chi.NewMux(), storage: storage, db: db, ctx: ctx}

	// "/index.html" now becomes "/app/dist/index.html"
	var err error
	service.app, err = fs.Sub(clientFS, "app/dist")
	if err != nil {
		log.Fatal(err)
	}

	// unauthenticated routes
	service.mux.Handle("/*", service.staticClientHandler())
	service.mux.Handle("/raw/{id}", service.rawEndpointHandler())
	service.mux.Get(config.INFO_ENDPOINT, service.infoEndpointHandler())
	service.mux.Post(config.VERIFY_ENDPOINT, service.verifyTokenEndpointHandler())

	// authenticated routes
	service.mux.Group(func(r chi.Router) {
		r.Use(service.authenticateToken)

		r.Get(config.FILELIST_ENDPOINT, service.fileListEndpointHandler())
		r.Post(config.UPLOAD_ENDPOINT, service.uploadEndpointHandler())
		r.Delete(config.DELETE_ENDPOINT, service.deleteEndpointHandler())
	})

	jobs.StartJobs(ctx)
	return service
}

func (service *Service) Serve(bindIP string, port int) error {
	addr := fmt.Sprintf("%s:%d", bindIP, port)

	log.Printf("Hosting service at %s", addr)
	return http.ListenAndServe(addr, service.mux)
}
