# QuickShare

Plug-n'-play file sharing web service. Simply generate a token using:

```sh
$ service token --new
```
> This will also generate a default `config.ini` file. Set the config absolute path using the `-c` flag.

Copy the displayed token, then start the web service using:

```sh
$ service host --port 80
```
> Note: to keep the service up use `screen`, or even better [write your own systemd service file](https://wiki.debian.org/systemd/Services)

Next, navigate to the web service in your browser and use the generated token to login and start sharing!

# Project structure

- `service`: Handles the http web service
    - `/app`: The frontend app hosted by the web service for web users
    - `/jobs`: Handles misc. long-running tasks (like file expiration)
- `cmd`: command line utils
    - `/service`: service to host the web service
- `api`: general handlers
    - `/iface`: shared interface types
    - `/sql`: database handler and driver
    - `/storage`: file storage
    - `/web`: web client (for go)
- `util`: general utility functions

TODOs:
- service: maybe add a /info/ route ? show file info; service/app: maybe add file previews (image viewer/video player)
- service/app: general 'make things pretty'
- *: grep 'TODO' && do them lol