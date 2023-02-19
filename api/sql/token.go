package sql

import (
	"github.com/blockloop/scan"
	"github.com/google/uuid"

	"github.com/CPunch/QuickShare/api/iface"
)

func GetTokenById(db DBQuery, id string) (*iface.Token, error) {
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

func GetAllTokens(db DBQuery) ([]iface.Token, error) {
	row, err := db.Query("SELECT * FROM tokens")
	if err != nil {
		return nil, err
	}

	var tkn []iface.Token
	if err := scan.Rows(&tkn, row); err != nil {
		return nil, err
	}

	return tkn, nil
}

func InsertToken(db DBQuery, isAdmin bool) (*iface.Token, error) {
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

func RemoveToken(db DBQuery, id string) (*iface.Token, error) {
	rows, err := db.Query("DELETE FROM tokens WHERE ID=? RETURNING *", id)
	if err != nil {
		return nil, err
	}

	var dbToken iface.Token
	if err := scan.Row(&dbToken, rows); err != nil {
		return nil, err
	}

	return &dbToken, nil
}
