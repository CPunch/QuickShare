package main

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/config"
	"github.com/google/subcommands"
)

type tokenCommand struct {
	createNew  bool
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
	f.BoolVar(&s.createNew, "new", false, "Generate a new token.")
	f.BoolVar(&s.listTokens, "list", false, "List all created tokens.")
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
