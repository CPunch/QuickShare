package sql

import (
	"github.com/blockloop/scan"
	"github.com/google/uuid"

	"github.com/CPunch/QuickShare/api/iface"
)

func (db *DBHandler) GetTokenById(id string) (*iface.Token, error) {
	row, err := db.Query("SELECT * FROM tokens WHERE ID=?", id)
	if err != nil {
		return nil, err
	}

	var tkn iface.Token
	if err := scan.Row(&tkn, row); err != nil {
		return nil, err
	}

	return &tkn, nil
}

func (db *DBHandler) InsertToken(isAdmin bool) (*iface.Token, error) {
	row, err := db.Query("INSERT INTO tokens (ID, IsAdmin) VALUES(?, ?) RETURNING *", uuid.New().String(), isAdmin)
	if err != nil {
		return nil, err
	}

	var tkn iface.Token
	if err := scan.Row(&tkn, row); err != nil {
		return nil, err
	}

	return &tkn, nil
}
