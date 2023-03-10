package util

import (
	"database/sql"
	"fmt"

	"github.com/CPunch/QuickShare/api/db"
	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/storage"
)

func removeFileTx(storage storage.StorageHandler, file *iface.File, tx *sql.Tx) error {
	_, err := db.RemoveFile(tx, file.ID)
	if err != nil {
		return fmt.Errorf("Failed to remove file: %v", err)
	}

	files, err := db.GetFilesByHash(tx, file.Sha256)
	if err != nil {
		return fmt.Errorf("Failed to get files by hash (%s): %v", file.Sha256, err)
	}

	// no more files are referencing the file hash?
	if len(files) == 0 {
		// delete the file from storage!
		if err := storage.DeleteFile(file.Sha256); err != nil {
			return fmt.Errorf("Failed to delete %s from storage: %v", file.Sha256, err)
		}
	}

	return nil
}

// removes the file from the database by ID, then if no other files exist with the same hash
// in the database, the file is also removed from storage.
func RemoveFile(storage storage.StorageHandler, dbHndlr *db.DBHandler, file *iface.File) error {
	return dbHndlr.Transaction(func(tx *sql.Tx) error {
		return removeFileTx(storage, file, tx)
	})
}
