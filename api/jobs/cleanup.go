package jobs

import (
	"context"
	"log"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
)

// max amount of files to remove per execution
const JANITOR_FILE_LIMIT = 10

func JanitorJob(ctx context.Context) {
	storage := ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	if storage == nil {
		log.Panic("[api/jobs/cleanup]: no storage instance attached to context!")
	}

	db := ctx.Value(config.CONTEXT_DB).(*sql.DBHandler)
	if db == nil {
		log.Panic("[api/jobs/cleanup]: no db instance attached to context!")
	}

	// grab expired files
	expiredFiles, err := db.GetExpiredFiles(JANITOR_FILE_LIMIT)
	if err != nil {
		log.Panic("[api/jobs/cleanup] Failed to get expired files: ", err)
	}

	for _, file := range expiredFiles {
		_, err := db.RemoveFile(file.ID)
		if err != nil {
			log.Panic("[api/jobs/cleanup] Failed to remove file: ", err)
		}

		files, err := db.GetFilesByHash(file.Sha256)
		if err != nil {
			log.Panic("[api/jobs/cleanup] Failed to grab files by hash: ", err)
		}

		// no more files are referencing the file hash?
		if len(files) == 0 {
			// delete the file from storage!
			if err := storage.DeleteFile(file.Sha256); err != nil {
				log.Panic("[api/jobs/cleanup] Failed to remove ", file, " from storage: ", err)
			}
		}

		log.Print("Successfully removed ", file)
	}
}
