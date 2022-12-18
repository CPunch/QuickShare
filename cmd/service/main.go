package main

import (
	"context"
	"flag"
	"os"

	"github.com/CPunch/QuickShare/config/load"
	"github.com/google/subcommands"
)

func main() {
	subcommands.Register(subcommands.HelpCommand(), "")
	subcommands.Register(subcommands.FlagsCommand(), "")
	subcommands.Register(subcommands.CommandsCommand(), "")
	subcommands.Register(&hostCommand{}, "")
	subcommands.Register(&tokenCommand{}, "")

	conf := flag.String("config", "config.ini", "configuration file")

	flag.Parse()
	ctx := load.LoadConfig(context.Background(), *conf)
	os.Exit(int(subcommands.Execute(ctx)))
}
