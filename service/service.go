package service

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/CPunch/QuickShare/config"
	"github.com/go-chi/chi/v5"
)

type Service struct {
	mux *chi.Mux
	ctx context.Context
}

func NewService(ctx context.Context) *Service {
	service := &Service{ctx: ctx, mux: chi.NewMux()}

	service.mux.Handle("/*", service.staticClientHandler())

	service.mux.Post(config.UPLOAD_ENPOINT, service.uploadEndpointHandler())
	service.mux.Get("/raw/{id}", service.rawEndpointHandler())
	return service
}

func (service *Service) Serve(bindIP string, port int) error {
	addr := fmt.Sprintf("%s:%d", bindIP, port)

	log.Printf("Hosting service at %s", addr)
	return http.ListenAndServe(addr, service.mux)
}
