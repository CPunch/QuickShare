package util

import (
	"fmt"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
)

func RemoveToken(storage storage.StorageHandler, db *sql.DBHandler, token *iface.Token) error {
	// remove all files created by this token
	files, err := db.GetFilesByToken(token.ID)
	if err != nil {
		return fmt.Errorf("Failed to remove file: %v", err)
	}

	for _, file := range files {
		RemoveFile(storage, db, &file)
	}

	// remove the token
	if _, err := db.RemoveToken(token.ID); err != nil {
		return err
	}
	return nil
}
