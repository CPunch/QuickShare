package sql

import (
	"database/sql"
	_ "embed"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

type DBHandler struct {
	db *sql.DB
}

//go:embed migrations/newdb.sql
var createDBQuery string

func OpenLiteDB(dbpath string) (*sql.DB, error) {
	sqliteFmt := fmt.Sprintf("%s", dbpath)

	db, err := sql.Open("sqlite3", sqliteFmt)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func (db *DBHandler) Query(query string, args ...any) (*sql.Rows, error) {
	return db.db.Query(query, args...)
}

func (db *DBHandler) Close() error {
	return db.db.Close()
}

func (db *DBHandler) Setup() error {
	// create db tables
	_, err := db.db.Exec(createDBQuery)
	return err
}
