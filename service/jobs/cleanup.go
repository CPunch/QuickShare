package jobs

import (
	"context"
	"log"

	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
	"github.com/CPunch/QuickShare/config"
	"github.com/CPunch/QuickShare/util"
)

// max amount of files to remove per execution
const JANITOR_FILE_LIMIT = 10

func JanitorJob(ctx context.Context) {
	storage := ctx.Value(config.CONTEXT_STORAGE).(storage.StorageHandler)
	if storage == nil {
		log.Panic("[service/jobs/JanitorJob]: no storage instance attached to context!")
	}

	db := ctx.Value(config.CONTEXT_DB).(*sql.DBHandler)
	if db == nil {
		log.Panic("[service/jobs/JanitorJob]: no db instance attached to context!")
	}

	// grab expired files
	expiredFiles, err := db.GetExpiredFiles(JANITOR_FILE_LIMIT)
	if err != nil {
		log.Panic("[service/jobs/JanitorJob]: Failed to get expired files: ", err)
	}

	for _, file := range expiredFiles {
		if err := util.RemoveFile(storage, db, &file); err != nil {
			log.Panic("[service/jobs/JanitorJob]: ", err)
		}

		log.Print("[service/jobs/JanitorJob]: ", "Successfully removed ", file.ID)
	}
}
