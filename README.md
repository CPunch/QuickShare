

```sh
$ service host
```
> starts the web service

```sh
$ service token --new
```
> generates a new token

# Project structure

- `service`: Handles the http web service
    - `/app`: The frontend app hosted by the web service for web users
- `cmd`: command line utils
    - `/cli`: cli to share files from your home machine
    - `/service`: service to host the web service
- `api`: general handlers
    - `/iface`: shared interface types
    - `/sql`: database handler and driver
    - `/storage`: file storage
    - `/web`: web client (for go)

TODOs:
- make web portal
- finish file expiration (implemented in routes, cli & db, just need watchdog/cronjob service)