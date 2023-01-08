package service

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"github.com/go-chi/chi/v5"
)

type Service struct {
	mux     *chi.Mux
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

	service.mux.Handle("/*", service.staticClientHandler())
	service.mux.Get("/raw/{id}", service.rawEndpointHandler())

	service.mux.Post(config.UPLOAD_ENDPOINT, service.uploadEndpointHandler())
	service.mux.Post(config.TOKEN_ENDPOINT, service.verifyTokenEndpointHandler())
	return service
}

func (service *Service) Serve(bindIP string, port int) error {
	addr := fmt.Sprintf("%s:%d", bindIP, port)

	log.Printf("Hosting service at %s", addr)
	return http.ListenAndServe(addr, service.mux)
}
