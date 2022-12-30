package sql

import (
	_ "encoding/json"
	"time"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/blockloop/scan"
	"github.com/google/uuid"
)

func (db *DBHandler) GetFileById(id string) (*iface.File, error) {
	row, err := db.Query("SELECT * FROM files WHERE ID=?", id)
	if err != nil {
		return nil, err
	}

	var file iface.File
	if err := scan.Row(&file, row); err != nil {
		return nil, err
	}

	return &file, nil
}

// files are stored many to one. 1 file on disk can represent many files in the db
func (db *DBHandler) GetFilesByHash(hash string) (*[]iface.File, error) {
	row, err := db.Query("SELECT * FROM files WHERE Sha256=?", hash)
	if err != nil {
		return nil, err
	}

	var files []iface.File
	if err := scan.Rows(&files, row); err != nil {
		return nil, err
	}

	return &files, nil
}

func (db *DBHandler) GetAllFiles() (*[]iface.File, error) {
	rows, _ := db.Query("SELECT * FROM files")

	var files []iface.File
	if err := scan.Rows(&files, rows); err != nil {
		return nil, err
	}

	return &files, nil
}

func (db *DBHandler) GetFilesByToken(token string) (*[]iface.File, error) {
	rows, _ := db.Query("SELECT * FROM files WHERE TokenID=?", token)

	var files []iface.File
	if err := scan.Rows(&files, rows); err != nil {
		return nil, err
	}

	return &files, nil
}

func (db *DBHandler) InsertFile(token, name, hash, mime string, expire time.Duration) (*iface.File, error) {
	rows, err := db.Query(
		"INSERT INTO files(ID, TokenID, Name, Sha256, Mime, Expire) VALUES(?, ?, ?, ?, ?, ?) RETURNING *",
		uuid.New().String(),
		token,
		name,
		hash,
		mime,
		time.Now().Add(expire),
	)
	if err != nil {
		return nil, err
	}

	var dbFile iface.File
	if err := scan.Row(&dbFile, rows); err != nil {
		return nil, err
	}

	return &dbFile, nil
}
