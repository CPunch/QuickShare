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

	// Grabs the file data from storage by hash (reads the whole file!! can be memory-intensive!!)
	GetFile(hash string) ([]byte, error)

	// send file to http.ResponseWriter (use this instead of GetFile() to send files to http responses!)
	SendFile(hash string, w http.ResponseWriter) error
}

const BUF_SIZE int = 1028

func hashFile(file io.Reader) (string, error) {
	h := sha256.New()
	buf := make([]byte, BUF_SIZE)

	// hash file
	for {
		sz, err := file.Read(buf)
		if err == io.EOF {
			break
		} else if err != nil {
			return "", err
		}

		h.Write(buf[0:sz])
	}

	return fmt.Sprintf("%x", h.Sum(nil)), nil
}
