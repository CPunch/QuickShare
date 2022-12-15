package load

import (
	"context"
	"log"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"gopkg.in/ini.v1"
)

func LoadConfig(ctx context.Context, configFile string) context.Context {
	cfg, err := ini.Load(configFile)
	if err != nil {
		log.Fatal(err)
	}

	// ============================ Database config
	var db *sql.DBHandler

	if dbPath := cfg.Section("sqlite").Key("file").String(); dbPath != "" {
		db, err = sql.OpenLiteDB(dbPath)
		if err != nil {
			log.Print(err)
		}
	} else {
		log.Fatal("Config is missing an 'sqlite' section!")
	}

	if err := db.Setup(); err != nil {
		log.Fatal(err)
	}

	ctx = context.WithValue(ctx, config.CONTEXT_DB, db)

	// ============================ Storage config
	var store storage.StorageHandler

	if rootDir := cfg.Section("storage").Key("rootDir").String(); rootDir != "" {
		store = storage.NewStorageIO(rootDir)
	} else {
		log.Fatal("Config is missing a storage section!")
	}

	ctx = context.WithValue(ctx, config.CONTEXT_STORAGE, store)

	return ctx
}
