package main

import (
	"context"
	_ "embed"
	"io"
	"log"
	"os"
	"strings"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"gopkg.in/ini.v1"
)

//go:embed config.ini
var defaultConfig string

func LoadConfig(ctx context.Context, configFile string) context.Context {
	// create default config (if not exist!!)
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		file, err := os.OpenFile(configFile, os.O_CREATE|os.O_RDWR, 0650)
		if err != nil {
			log.Fatal(err)
		}

		// write default config to disk
		io.Copy(file, strings.NewReader(defaultConfig))
		file.Close()
	}

	// now load the config
	cfg, err := ini.Load(configFile)
	if err != nil {
		log.Fatal(err)
	}

	// ============================ Database config
	var db *sql.DBHandler

	if cfg.HasSection("db.sqlite") {
		if cfg.Section("db.sqlite").HasKey("file") {
			dbPath := cfg.Section("db.sqlite").Key("file").String()
			db, err = sql.OpenLiteDB(dbPath)
			if err != nil {
				log.Print(err)
			}
		} else {
			log.Fatal("Config section 'db.sqlite' missing 'file' key!")
		}
	} else { // TODO: as quickshare supports more db's add the sections as needed
		log.Fatal("Config is missing a 'db.*' section!")
	}

	if err := db.Setup(); err != nil {
		log.Fatal(err)
	}

	ctx = context.WithValue(ctx, config.CONTEXT_DB, db)

	// ============================ Storage config
	var store storage.StorageHandler

	if cfg.HasSection("storage.io") {
		if cfg.Section("storage.io").HasKey("rootDir") {
			rootDir := cfg.Section("storage.io").Key("rootDir").String()
			store = storage.NewStorageIO(rootDir)
		} else {
			log.Fatal("Config section 'storage.io' missing 'rootDir' key!")
		}
	} else {
		log.Fatal("Config is missing a storage section!")
	}

	ctx = context.WithValue(ctx, config.CONTEXT_STORAGE, store)

	// ============================ HTTP config
	var maxSize int64

	if cfg.HasSection("http") {
		if cfg.Section("http").HasKey("maxUploadSize") {
			maxSize, err = cfg.Section("http").Key("maxUploadSize").Int64()
			if err != nil {
				log.Fatal("Config section 'http': expected a number for 'maxUploadSize' key!")
			}
		} else {
			log.Fatal("Config section 'http' missing 'maxUploadSize' key!")
		}
	} else {
		log.Fatal("Config is missing a http section!")
	}

	ctx = context.WithValue(ctx, config.CONTEXT_MAXUPLOADSIZE, maxSize)
	return ctx
}
