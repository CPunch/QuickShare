package main

import (
	"context"
	"flag"

	"github.com/google/subcommands"

	"github.com/CPunch/QuickShare/service"
)

type serviceCommand struct {
	port int
}

func (s *serviceCommand) Name() string {
	return "service"
}

func (s *serviceCommand) Synopsis() string {
	return "Starts web service"
}

func (s *serviceCommand) Usage() string {
	return s.Name() + ":\n"
}

func (s *serviceCommand) SetFlags(f *flag.FlagSet) {
	f.IntVar(&s.port, "port", 8080, "Hosts the web service on this port.")
}

func (s *serviceCommand) Execute(ctx context.Context, f *flag.FlagSet, _ ...interface{}) subcommands.ExitStatus {
	server := service.NewService(ctx)
	server.Serve("127.0.0.1", s.port)

	// will never reach this but w/e
	return subcommands.ExitSuccess
}
