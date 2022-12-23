package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/google/subcommands"
	"gopkg.in/ini.v1"
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
	conf := ctx.Value(CONTEXT_CONFIG).(string)

	if s.baseUrl == "https://share.example.com" || s.token == "my-example-token" {
		fmt.Println("baseUrl and token must be set!")
		return subcommands.ExitUsageError
	}

	// grab config file
	file, err := os.OpenFile(conf, os.O_CREATE|os.O_RDWR, 0750)
	if err != nil {
		fmt.Println(err)
		return subcommands.ExitFailure
	}
	defer file.Close()

	// craft & write ini
	configIni := ini.Empty()
	configIni.Section("").NewKey(CONFIG_BASEURL, s.baseUrl)
	configIni.Section("").NewKey(CONFIG_TOKEN, s.token)
	if _, err = configIni.WriteTo(file); err != nil {
		fmt.Println(err)
		return subcommands.ExitFailure
	}

	fmt.Printf("setup info written to %s!\n", conf)
	return subcommands.ExitSuccess
}
