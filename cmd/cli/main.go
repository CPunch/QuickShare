package main

import (
	"context"
	"flag"
	"os"
	"path/filepath"

	"github.com/google/subcommands"
)

const CONFIG_FILE = "config.ini"

// tries to setup the config file location & return the absolute config
// filepath, failures are ignored and a relative path is returned.
func getConfigPath() string {
	homeDir := os.Getenv("HOME")

	// environment is weird, just look for a config file in the current
	// directory
	if homeDir == "" {
		return CONFIG_FILE
	}

	// make sure directory exists
	configDir := filepath.Join(homeDir, ".config", "quickshare")
	if err := os.MkdirAll(configDir, 0660); err != nil {
		// ignore error, environment is weird
		return CONFIG_FILE
	}

	// $HOME/.config/quickshare/config.ini
	return filepath.Join(configDir, CONFIG_FILE)
}

func main() {
	subcommands.Register(subcommands.HelpCommand(), "")
	subcommands.Register(subcommands.FlagsCommand(), "")
	subcommands.Register(subcommands.CommandsCommand(), "")
	subcommands.Register(&setupCommand{}, "")

	conf := flag.String("config", getConfigPath(), "configuration file")

	// TODO: the config file won't exist for the setup command. Should the
	// config argument just be passed to the commands as a context value?
	// That way, each command can choose to load the config or not?
	ctx := LoadConfig(context.Background(), *conf)
	os.Exit(int(subcommands.Execute(ctx)))
}
