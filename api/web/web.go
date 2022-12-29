package web

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

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

func (client *WebClient) PostFile(reader io.Reader, filename string, expire time.Duration) (*iface.File, error) {
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

	// write expire time
	timew, err := writer.CreateFormField("expire")
	if err != nil {
		return nil, err
	}

	if _, err := io.Copy(timew, strings.NewReader(expire.String())); err != nil {
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
	req, err := http.NewRequest("POST", client.baseUrl+config.UPLOAD_ENDPOINT, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	res, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		// service responds with a detailed message (usually)
		resBody, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, fmt.Errorf("Service responded with status code %d!", res.StatusCode)
		}

		return nil, fmt.Errorf("Service responded with %s!", string(resBody))
	}

	// read response
	var file iface.File
	dec := json.NewDecoder(res.Body)
	if err := dec.Decode(&file); err != nil {
		return nil, err
	}

	return &file, nil
}

func (client *WebClient) VerifyToken() (*iface.Token, error) {
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
	writer.Close()

	// send request
	req, err := http.NewRequest("POST", client.baseUrl+config.TOKEN_ENDPOINT, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	res, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		// service responds with a detailed message (usually)
		resBody, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, fmt.Errorf("Service responded with status code %d!", res.StatusCode)
		}

		return nil, fmt.Errorf("Service responded with %s!", string(resBody))
	}

	// read response
	var tkn iface.Token
	dec := json.NewDecoder(res.Body)
	if err := dec.Decode(&tkn); err != nil {
		return nil, err
	}

	return &tkn, nil
}
