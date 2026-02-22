<p align='center'>
  <img alt='Clear Candy logo' width='200' src='https://raw.githubusercontent.com/blackcandy-org/black_candy/master/app/assets/images/logo.svg'>
</p>

# Clear Candy

A self-hosted music streaming server — your personal music center.

Forked from [Black Candy](https://github.com/blackcandy-org/black_candy) with the goal of improved reliability and new features.

## Installation

Clear Candy uses a docker image for easy installation:

```shell
docker run -p 80:80 ghcr.io/blackcandy-org/blackcandy:latest
```

Access http://localhost or http://host-ip in a browser. Log in with the initial admin user (email: admin@admin.com, password: foobar).

## Upgrade

> [!IMPORTANT]
> Read the upgrade guide carefully before upgrading — there may be breaking changes.
>
> See the [Upgrade Guide](https://github.com/blackcandy-org/blackcandy/blob/master/docs/upgrade.md)

```shell
docker pull ghcr.io/blackcandy-org/blackcandy:latest
docker stop <your_container>
docker rm <your_container>
docker run <OPTIONS> ghcr.io/blackcandy-org/blackcandy:latest
```

With docker compose:

```shell
docker pull ghcr.io/blackcandy-org/blackcandy:latest
docker-compose down
docker-compose up
```

## Configuration

### Port Mapping

```shell
docker run -p 3000:80 ghcr.io/blackcandy-org/blackcandy:latest
```

### Media Files Mounts

```shell
docker run -v /media_data:/media_data -e MEDIA_PATH=/media_data ghcr.io/blackcandy-org/blackcandy:latest
```

### Use PostgreSQL As Database

Clear Candy uses SQLite by default. For better concurrency and reliability, PostgreSQL is recommended:

```shell
docker run -e DB_ADAPTER=postgresql -e DB_URL=postgresql://yourdatabaseurl ghcr.io/blackcandy-org/blackcandy:latest
```

### How to Persist Data

All persistent data is stored in `/app/storage`:

```shell
mkdir storage_data
docker run -v ./storage_data:/app/storage ghcr.io/blackcandy-org/blackcandy:latest
```

### Running as an Arbitrary User

```shell
docker run --user 2000:2000 -v ./storage_data:/app/storage ghcr.io/blackcandy-org/blackcandy:latest
```

### Logging

Clear Candy logs to `STDOUT` by default. See [Docker logging docs](https://docs.docker.com/config/containers/logging/configure/).

## Environment Variables

| Name | Default | Description |
| --- | --- | --- |
| DB_URL | | PostgreSQL database URL (required if using PostgreSQL) |
| CABLE_DB_URL | | Pub/Sub database URL (required if using PostgreSQL) |
| QUEUE_DB_URL | | Background job database URL (required if using PostgreSQL) |
| CACHE_DB_URL | | Cache database URL (required if using PostgreSQL) |
| MEDIA_PATH | | Media path for music files (can also be set in settings page) |
| DB_ADAPTER | "sqlite" | Database adapter: "sqlite" or "postgresql" |
| SECRET_KEY_BASE | | Set to persist sessions across restarts |
| FORCE_SSL | false | Force all access over SSL |
| DEMO_MODE | false | Enable demo mode (restricts admin privileges) |

## Development

### Requirements

- Ruby 3.4
- Node.js 20
- libvips
- FFmpeg

### Setup

```shell
bundle install
npm install
rails db:prepare
rails db:seed
```

### Start Development

```shell
./bin/dev
```

Visit http://localhost:3000 (email: admin@admin.com, password: foobar).

### Running Tests

```shell
rails test:all
rails lint:all
```

## Integrations

Clear Candy supports fetching artist and album images from the Discogs API. Create a Discogs API token and set it on the Settings page.

## Credits

Based on [Black Candy](https://github.com/blackcandy-org/black_candy) by the blackcandy-org team.
