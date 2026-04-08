# Preview And Deploy

## Fastest Way To See It Locally

1. Copy `.env.example` to `.env`.
2. Run `npm run dev:web` from the repo root.
3. Open `http://localhost:3000`.

If you also want the API running locally, use `npm run dev:api` in a second terminal.

## Minimal Server Preview With Domain

This repository now includes:

- `apps/web/Dockerfile`
- `apps/api/Dockerfile`
- `apps/worker/Dockerfile`
- `deploy/docker-compose.preview.yml`
- `deploy/Caddyfile`

The preview stack serves:

- web app on `DOMAIN`
- API under `https://DOMAIN/api/*`
- automatic HTTPS via Caddy

## Server Requirements

- Linux server with Docker and Docker Compose plugin
- A domain or subdomains already pointed to the server IP
- Ports 80 and 443 open

## Deploy Steps

1. Copy the repository to the server.
2. Copy `.env.example` to `.env` and fill required values.
3. Set the domain inside `.env`:

```env
DOMAIN=app.example.com
```

1. Start the preview stack:

```bash
bash deploy/up-preview.sh
```

## Check The Result

- Web: `https://app.example.com`
- API health: `https://app.example.com/api/health`

## Notes

- The current UI is still the bootstrap shell, not the final product UI.
- Database, Redis, object storage, and real auth are not wired yet.
- This deploy path is for previewing the foundation and future iterations, not production launch.
