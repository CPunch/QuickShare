package util

import (
	"database/sql"
	"fmt"

	"github.com/CPunch/QuickShare/api/db"
	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/storage"
)

func RemoveToken(storage storage.StorageHandler, dbHndlr *db.DBHandler, token *iface.Token) error {
	return dbHndlr.Transaction(func(tx *sql.Tx) error {
		// remove all files created by this token
		files, err := db.GetFilesByToken(tx, token.ID)
		if err != nil {
			return fmt.Errorf("Failed to remove token: %v", err)
		}

		// TODO: print out info on removed files maybe ?
		for _, file := range files {
			removeFileTx(storage, &file, tx)
		}

		// remove the token
		if _, err := db.RemoveToken(tx, token.ID); err != nil {
			return err
		}
		return nil
	})
}
