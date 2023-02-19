package util

import (
	_sql "database/sql"
	"fmt"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/api/sql"
	"github.com/CPunch/QuickShare/api/storage"
)

func RemoveToken(storage storage.StorageHandler, db *sql.DBHandler, token *iface.Token) error {
	return db.Transaction(func(tx *_sql.Tx) error {
		// remove all files created by this token
		files, err := sql.GetFilesByToken(tx, token.ID)
		if err != nil {
			return fmt.Errorf("Failed to remove token: %v", err)
		}

		// TODO: print out info on removed files maybe ?
		for _, file := range files {
			removeFileTx(storage, db, &file, tx)
		}

		// remove the token
		if _, err := sql.RemoveToken(tx, token.ID); err != nil {
			return err
		}
		return nil
	})
}
