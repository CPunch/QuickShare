package iface

import (
	"database/sql/driver"
	"time"
)

// thanks to lib/pq !!
// https://github.com/lib/pq/blob/b269bd035a727d6c1081f76e7a239a1b00674c40/encode.go#L521
type NullTime struct {
	Time  time.Time
	Valid bool // Valid is true if Time is not NULL
}

// Scan implements the Scanner interface.
func (nt *NullTime) Scan(value interface{}) error {
	nt.Time, nt.Valid = value.(time.Time)
	return nil
}

// Value implements the driver Valuer interface.
func (nt NullTime) Value() (driver.Value, error) {
	if !nt.Valid {
		return nil, nil
	}
	return nt.Time, nil
}

type File struct {
	ID         string    `json:"id"`
	TokenID    string    `json:"tokenId"`
	Sha256     string    `json:"hash"`
	Name       string    `json:"name"`
	Mime       string    `json:"mime"`
	Expire     *NullTime `json:"expire"`
	UploadIP   string    `json:"uploadIp"`
	UploadTime time.Time `json:"uploadTime"`
}
