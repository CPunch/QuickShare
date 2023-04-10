package service

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"

	"github.com/CPunch/QuickShare/api/db"
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
	dbHndlr *db.DBHandler
	ctx     context.Context
}

func NewService(ctx context.Context) *Service {
	storage := ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	dbHndlr := ctx.Value(config.CONTEXT_DBHANDLER).(*db.DBHandler)

	service := &Service{storage: storage, dbHndlr: dbHndlr, ctx: ctx}

	// "/index.html" now becomes "/app/dist/index.html"
	var err error
	service.app, err = fs.Sub(clientFS, "app/dist")
	if err != nil {
		log.Fatal(err)
	}

	// unauthenticated routes
	serviceMux := chi.NewRouter()
	serviceMux.Handle("/*", service.staticClientHandler())
	serviceMux.Handle("/raw/{id}", service.rawEndpointHandler())
	serviceMux.Post("/api/verify", service.verifyTokenEndpointHandler())
	serviceMux.Get("/api/file", service.infoEndpointHandler())

	// API
	apiMux := chi.NewMux()
	apiMux.Group(func(r chi.Router) {
		r.Use(service.authenticateToken)

		r.Get("/filelist", service.fileListEndpointHandler())

		// file REST
		r.Post("/file", service.uploadEndpointHandler())
		r.Delete("/file", service.deleteEndpointHandler())
	})
	serviceMux.Mount("/api", apiMux)

	service.mux = serviceMux
	jobs.StartJobs(ctx)
	return service
}

func (service *Service) Serve(bindIP string, port int) error {
	addr := fmt.Sprintf("%s:%d", bindIP, port)

	log.Printf("Hosting service at %s", addr)
	return http.ListenAndServe(addr, service.mux)
}
