package util

import (
	"fmt"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
)

func RemoveFile(storage storage.StorageHandler, db *sql.DBHandler, file *iface.File) error {
	_, err := db.RemoveFile(file.ID)
	if err != nil {
		return fmt.Errorf("Failed to remove file: %v", err)
	}

	files, err := db.GetFilesByHash(file.Sha256)
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
