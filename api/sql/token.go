package sql

import (
	"github.com/blockloop/scan"

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
