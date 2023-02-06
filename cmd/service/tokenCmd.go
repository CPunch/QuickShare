package main

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"github.com/CPunch/QuickShare/util"
	"github.com/google/subcommands"
)

type tokenCommand struct {
	createNew  bool
	remove     string
	listTokens bool
}

func (s *tokenCommand) Name() string {
	return "token"
}

func (s *tokenCommand) Synopsis() string {
	return "Generate and manipulate tokens"
}

func (s *tokenCommand) Usage() string {
	return s.Name() + " - " + s.Synopsis() + ":\n"
}

func (s *tokenCommand) SetFlags(f *flag.FlagSet) {
	f.BoolVar(&s.createNew, "new", false, "Generate a new token")
	f.StringVar(&s.remove, "remove", "", "Remove a token")
	f.BoolVar(&s.listTokens, "list", false, "List all created tokens")
}

func printToken(tkn *iface.Token) {
	fmt.Printf("ID:\t\t%s\nIsAdmin:\t%t\n", tkn.ID, tkn.IsAdmin)
}

func (s *tokenCommand) Execute(ctx context.Context, f *flag.FlagSet, _ ...interface{}) subcommands.ExitStatus {
	db := ctx.Value(config.CONTEXT_DB).(*sql.DBHandler)
	if db == nil {
		log.Print("[cmd/service/tokenCmd]: no db instance attached to context!")
		return subcommands.ExitFailure
	}

	storage := ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	if storage == nil {
		log.Print("[cmd/service/tokenCmd]: no storage instance attached to context!")
		return subcommands.ExitFailure
	}

	// $ token --new
	if s.createNew {
		tkn, err := db.InsertToken(false)
		if err != nil {
			log.Print("[cmd/service/tokenCmd]: SQL Error while inserting token ", err)
			return subcommands.ExitFailure
		}

		fmt.Print("Generated new token!\n\n")
		printToken(tkn)
		return subcommands.ExitSuccess
	}

	// $ token --remove
	if s.remove != "" {
		tkn, err := db.GetTokenById(s.remove)
		if err != nil || tkn == nil {
			log.Print("[cmd/service/tokenCmd]: Failed to find token! ", err)
			return subcommands.ExitFailure
		}

		if err := util.RemoveToken(storage, db, tkn); err != nil {
			log.Print("[cmd/service/tokenCmd]: Failed to remove token! ", err)
			return subcommands.ExitFailure
		}

		log.Printf("Successfully removed %s!\n", s.remove)
	}

	// $ token --list
	if s.listTokens {
		tkns, err := db.GetAllTokens()
		if err != nil {
			log.Print("[cmd/service/tokenCmd]: SQL Error while grabbing tokens ", err)
			return subcommands.ExitFailure
		}

		for _, tkn := range tkns {
			printToken(&tkn)
		}
		return subcommands.ExitSuccess
	}

	return subcommands.ExitUsageError
}
