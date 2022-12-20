package main

import (
	"context"
	"log"

	"gopkg.in/ini.v1"
)

const CONTEXT_BASEURL = "baseUrl"
const CONTEXT_TOKEN = "token"

func LoadConfig(ctx context.Context, configFile string) context.Context {
	cfg, err := ini.Load(configFile)
	if err != nil {
		log.Fatal(err)
	}

	baseUrl := cfg.Section("").Key("baseUrl").String()
	if baseUrl == "" {
		log.Fatal("baseUrl missing!")
	}

	ctx = context.WithValue(ctx, CONTEXT_BASEURL, baseUrl)

	token := cfg.Section("").Key("token").String()
	if token == "" {
		log.Fatal("token missing!")
	}

	ctx = context.WithValue(ctx, CONTEXT_TOKEN, token)
	return ctx
}
