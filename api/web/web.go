package web

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/CPunch/QuickShare/api/iface"
	"github.com/CPunch/QuickShare/config"
)

type WebClient struct {
	baseUrl string
	token   string
}

func NewClient(baseUrl, token string) *WebClient {
	return &WebClient{
		baseUrl: baseUrl,
		token:   token,
	}
}

func (client *WebClient) PostFile(reader io.Reader, filename string) (*iface.File, error) {
	httpClient := &http.Client{}
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// write token
	tknw, err := writer.CreateFormField("token")
	if err != nil {
		return nil, err
	}

	if _, err := io.Copy(tknw, strings.NewReader(client.token)); err != nil {
		return nil, err
	}

	// write file
	fw, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, err
	}

	if _, err := io.Copy(fw, reader); err != nil {
		return nil, err
	}
	writer.Close()

	// send request
	req, err := http.NewRequest("POST", client.baseUrl+config.UPLOAD_ENPOINT, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	res, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Server responded with status code %d!", res.StatusCode)
	}

	// read response
	var file iface.File
	dec := json.NewDecoder(res.Body)
	if err := dec.Decode(&file); err != nil {
		return nil, err
	}

	return &file, nil
}
