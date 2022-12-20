package main

import (
	"context"
	"flag"

	"github.com/google/subcommands"
)

type setupCommand struct {
	baseUrl string
	token   string
}

func (s *setupCommand) Name() string {
	return "setup"
}

func (s *setupCommand) Synopsis() string {
	return "Setup a local config to easily & quickly share files from the cli"
}

func (s *setupCommand) Usage() string {
	return s.Name() + " - " + s.Synopsis() + ":\n"
}

func (s *setupCommand) SetFlags(f *flag.FlagSet) {
	f.StringVar(
		&s.baseUrl,
		"baseUrl",
		"https://share.example.com",
		"baseUrl that points to the QuickShare web service",
	)
	f.StringVar(
		&s.token,
		"token",
		"my-example-token",
		"token used to authenticate with the web service",
	)
}

func (s *setupCommand) Execute(ctx context.Context, f *flag.FlagSet, _ ...interface{}) subcommands.ExitStatus {
	return subcommands.ExitSuccess
}
