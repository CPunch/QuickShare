package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/CPunch/QuickShare/api/web"
	"github.com/google/subcommands"
)

type shareCommand struct {
	expire time.Duration
}

func (s *shareCommand) Name() string {
	return "share"
}

func (s *shareCommand) Synopsis() string {
	return "Shares a file"
}

func (s *shareCommand) Usage() string {
	return s.Name() + " <files to upload...> - " + s.Synopsis() + ":\n"
}

func (s *shareCommand) SetFlags(f *flag.FlagSet) {
	f.DurationVar(
		&s.expire,
		"expire",
		0,
		"delta time to keep the file available. a zero duration represents 'forever'.",
	)
}

func (s *shareCommand) Execute(ctx context.Context, f *flag.FlagSet, _ ...interface{}) subcommands.ExitStatus {
	conf := ctx.Value(CONTEXT_CONFIG).(string)

	if len(f.Args()) == 0 {
		return subcommands.ExitUsageError
	}

	// grab config
	ctx = LoadConfig(ctx, conf)
	baseUrl := ctx.Value(CONTEXT_BASEURL).(string)
	token := ctx.Value(CONTEXT_TOKEN).(string)
	client := web.NewClient(baseUrl, token)

	for _, fpath := range f.Args() {
		file, err := os.OpenFile(fpath, os.O_RDONLY, 0)
		if err != nil {
			fmt.Println(err)
			return subcommands.ExitFailure
		}
		defer file.Close()

		sharedFile, err := client.PostFile(file, filepath.Base(fpath), s.expire)
		if err != nil {
			fmt.Println("Failed to upload", fpath, "--", err)
			return subcommands.ExitFailure
		}

		fmt.Printf("Shared %s! URL: %s/raw/%s\n", filepath.Base(fpath), baseUrl, sharedFile.ID)
	}
	return subcommands.ExitSuccess
}
