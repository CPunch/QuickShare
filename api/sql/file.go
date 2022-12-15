package sql

import (
	_ "encoding/json"
	"time"

	"github.com/blockloop/scan"
	"github.com/google/uuid"
)

type FileDBType struct {
	ID         string    `json:"id"`
	TokenID    string    `json:"tokenId"`
	Sha256     string    `json:"hash"`
	Name       string    `json:"name"`
	Mime       string    `json:"mime"`
	UploadIP   string    `json:"uploadIp"`
	UploadTime time.Time `json:"uploadTime"`
}

func (db *DBHandler) GetFileById(id string) (*FileDBType, error) {
	row, err := db.Query("SELECT * FROM files WHERE ID=?", id)
	if err != nil {
		return nil, err
	}

	var file FileDBType
	if err := scan.Row(&file, row); err != nil {
		return nil, err
	}

	return &file, nil
}

// files are stored many to one. 1 file on disk can represent many files in the db
func (db *DBHandler) GetFilesByHash(hash string) (*[]FileDBType, error) {
	row, err := db.Query("SELECT * FROM files WHERE Sha256=?", hash)
	if err != nil {
		return nil, err
	}

	var files []FileDBType
	if err := scan.Rows(&files, row); err != nil {
		return nil, err
	}

	return &files, nil
}

func (db *DBHandler) GetAllFiles() (*[]FileDBType, error) {
	rows, _ := db.Query("SELECT * FROM files")

	var files []FileDBType
	if err := scan.Rows(&files, rows); err != nil {
		return nil, err
	}

	return &files, nil
}

func (db *DBHandler) GetFilesByToken(token string) (*[]FileDBType, error) {
	rows, _ := db.Query("SELECT * FROM files WHERE TokenID=?", token)

	var files []FileDBType
	if err := scan.Rows(&files, rows); err != nil {
		return nil, err
	}

	return &files, nil
}

func (db *DBHandler) InsertFile(token, name, hash, mime string) (*FileDBType, error) {
	// TODO: ID should be a slug, short and human readable
	rows, _ := db.Query("INSERT INTO files(ID, TokenID, Name, Sha256, Mime) VALUES(?, ?, ?, ?, ?) RETURNING *", uuid.New().String(), token, name, hash, mime)

	var dbFile FileDBType
	if err := scan.Row(&dbFile, rows); err != nil {
		return nil, err
	}

	return &dbFile, nil
}
