package iface

import (
	"database/sql/driver"
	"encoding/json"
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

// support json.Marshal()
func (nt *NullTime) MarshalJSON() ([]byte, error) {
	if nt.Valid {
		return json.Marshal(nt.Time)
	}

	return json.Marshal(nil)
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
	TokenID    string    `json:"-"` // this data should NEVER be sent to the client !!!
	Sha256     string    `json:"hash"`
	Size       int64     `json:"size"`
	Name       string    `json:"name"`
	Mime       string    `json:"mime"`
	Expire     *NullTime `json:"expire"`
	UploadIP   string    `json:"-"`
	UploadTime time.Time `json:"uploadTime"`
}
