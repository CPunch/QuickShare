package storage

import (
	"fmt"
	"io"
	"log"
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

// TODO: add an error result ? maybe ?
func NewStorageIO(root string) StorageHandler {
	if err := os.MkdirAll(root, 0750); err != nil {
		log.Fatal("[api/storage/NewStorageIO]:", err)
	}

	// some UNIX-like OSes have a default umask value that doesn't allow mkdir to create directories with permission 750.
	// so we still need to explicitly set the perms using chmod
	if err := os.Chmod(root, 0750); err != nil {
		log.Fatal("[api/storage/NewStorageIO]:", err)
	}

	return &StorageIOHandler{root: root}
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

	// write file to IO storage (we reuse the file on-disk if it's been uploaded before)
	filePath := storage.root + hash
	var size int64
	if stat, err := os.Stat(filePath); os.IsNotExist(err) {
		rawFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			return nil, err
		}
		defer rawFile.Close()
		size, _ = io.Copy(rawFile, file)
	} else {
		size = stat.Size()
	}

	return &iface.File{Name: header.Filename, Sha256: hash, Mime: mType.String(), Size: size}, nil
}

// Remove the file from storage
func (storage *StorageIOHandler) DeleteFile(hash string) error {
	if err := os.Remove(storage.root + hash); err != nil {
		return err
	}

	return nil
}

// reads whole file into memory from storage
func (storage *StorageIOHandler) GetFile(hash string) ([]byte, error) {
	data, err := os.ReadFile(storage.root + hash)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (storage *StorageIOHandler) SendFile(ifile *iface.File, w http.ResponseWriter) error {
	file, err := os.OpenFile(storage.root+ifile.Sha256, os.O_RDONLY, 0750)
	if err != nil {
		return err
	}
	defer file.Close()

	// send file
	w.Header().Set("Content-Disposition", fmt.Sprintf(": attachment; filename=\"%s\"", ifile.Name))
	w.Header().Set("Content-Type", ifile.Mime)
	if _, err := io.Copy(w, file); err != nil {
		return err
	}

	return nil
}
