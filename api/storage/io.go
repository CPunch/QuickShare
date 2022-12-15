package storage

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/gabriel-vasile/mimetype"

	"github.com/CPunch/QuickShare/api/iface"
)

// ========================== IO Storage

type StorageIOHandler struct {
	root string
}

func NewStorageIO(root string) StorageHandler {
	return &StorageIOHandler{root: root} // TODO: create directory if it doesn't exist
}

// Accepts the file and stores it. Does NOT insert the file into the db.
func (storage *StorageIOHandler) AcceptFile(header *multipart.FileHeader, file multipart.File) (*iface.File, error) {
	// grab mime type (TODO: maybe trust the *multipart.FileHeader for the mime type?)
	mimetype.SetLimit(3072) // max size of header to read
	mType, err := mimetype.DetectReader(file)
	if err != nil {
		return nil, err
	}
	file.Seek(0, io.SeekStart) // restart stream

	// grab hash (reads the whole file)
	hash, err := hashFile(file)
	if err != nil {
		return nil, err
	}
	file.Seek(0, io.SeekStart) // restart stream

	// write file to IO storage (we reuse the file on-disk if it's been uploaded before by naming the file the hash)
	rawFile, err := os.OpenFile(storage.root+hash, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return nil, err
	}
	defer rawFile.Close()
	io.Copy(rawFile, file)

	return &iface.File{Name: header.Filename, Sha256: hash, Mime: mType.String()}, nil
}

// reads whole file into memory from storage
func (storage *StorageIOHandler) GetFile(hash string) ([]byte, error) {
	data, err := os.ReadFile(storage.root + hash)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (storage *StorageIOHandler) SendFile(hash string, w http.ResponseWriter) error {
	file, err := os.OpenFile(storage.root+hash, os.O_RDONLY, 0666)
	if err != nil {
		return err
	}

	buf := make([]byte, BUF_SIZE)

	// TODO: write the mime Content-Type header, maybe accept a *sql.FileFBType instead of just the hash?

	// send the file in chunks of BUF_SIZE
	for {
		_, err := file.Read(buf)
		if err == io.EOF {
			break
		} else if err != nil {
			return err
		}

		_, err = w.Write(buf)
		if err != nil {
			return err
		}
	}

	return nil
}
