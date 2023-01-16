package storage

import (
	"crypto/sha256"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/CPunch/QuickShare/api/iface"
)

type StorageHandler interface {
	// Accepts the file and stores it. Does NOT insert the file into the db.
	AcceptFile(*multipart.FileHeader, multipart.File) (*iface.File, error)

	// Remove the file from storage
	DeleteFile(hash string) error

	// Grabs the file data from storage by hash (reads the whole file!! can be memory-intensive!!)
	GetFile(hash string) ([]byte, error)

	// send file to http.ResponseWriter (use this instead of GetFile() to send files to http responses!)
	SendFile(ifile *iface.File, w http.ResponseWriter) error
}

func hashFile(file io.Reader) (string, error) {
	h := sha256.New()

	// hash file
	if _, err := io.Copy(h, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", h.Sum(nil)), nil
}
