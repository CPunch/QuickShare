package iface

import "time"

type File struct {
	ID         string    `json:"id"`
	TokenID    string    `json:"tokenId"`
	Sha256     string    `json:"hash"`
	Name       string    `json:"name"`
	Mime       string    `json:"mime"`
	UploadIP   string    `json:"uploadIp"`
	UploadTime time.Time `json:"uploadTime"`
}
