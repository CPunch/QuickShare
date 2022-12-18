package main

import (
	"context"
	"flag"
	"log"

	"github.com/google/subcommands"

	"github.com/CPunch/QuickShare/service"
)

type hostCommand struct {
	port int
}

func (s *hostCommand) Name() string {
	return "host"
}

func (s *hostCommand) Synopsis() string {
	return "Starts web service"
}

func (s *hostCommand) Usage() string {
	return s.Name() + " - " + s.Synopsis() + ":\n"
}

func (s *hostCommand) SetFlags(f *flag.FlagSet) {
	f.IntVar(&s.port, "port", 8080, "Hosts the web service on this port.")
}

func (s *hostCommand) Execute(ctx context.Context, f *flag.FlagSet, _ ...interface{}) subcommands.ExitStatus {
	server := service.NewService(ctx)
	if err := server.Serve("127.0.0.1", s.port); err != nil {
		log.Print(err)
		return subcommands.ExitFailure
	}

	// will never reach this but w/e
	return subcommands.ExitSuccess
}
