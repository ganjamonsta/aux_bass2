# GanjaCraft Server Preview

## Target

- Domain: `aux.ganj4craft.ru`
- Server OS: Debian 12
- User: `ganjamonsta`
- App location: `/opt/aux_player2`

## DNS

Before deploy, point the `A` record for `aux.ganj4craft.ru` to your server IP.

## 1. Prepare The Server

SSH into the server and create the app directory:

```bash
ssh ganjamonsta@YOUR_SERVER_IP
sudo mkdir -p /opt/aux_player2
sudo chown -R ganjamonsta:ganjamonsta /opt/aux_player2
```

Check Docker availability:

```bash
docker --version
docker compose version
```

If Docker is missing, install it first.

## 2. Upload The Project

From your local machine:

```bash
scp -r s:/git/aux_player2/* ganjamonsta@YOUR_SERVER_IP:/opt/aux_player2/
```

If you prefer git on the server, clone into `/opt/aux_player2` instead.

## 3. Create Environment File

On the server:

```bash
cd /opt/aux_player2
cp .env.example .env
```

Set at least these values in `.env`:

```env
DOMAIN=aux.ganj4craft.ru
NEXT_PUBLIC_APP_URL=https://aux.ganj4craft.ru
API_PORT=4000
WEB_PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
```

Everything else can stay placeholder for now because the current preview does not yet depend on Postgres, Redis, Telegram auth, or object storage.

## 4. Start The Preview Stack

On the server:

```bash
cd /opt/aux_player2
bash deploy/up-preview.sh
```

## 5. Verify

Check containers:

```bash
cd /opt/aux_player2/deploy
docker compose -f docker-compose.preview.yml ps
```

Check logs if needed:

```bash
docker compose -f docker-compose.preview.yml logs -f caddy web api
```

Open these URLs:

- `https://aux.ganj4craft.ru`
- `https://aux.ganj4craft.ru/api/health`

## 6. Updating Later

When you change the code:

```bash
cd /opt/aux_player2/deploy
docker compose -f docker-compose.preview.yml up -d --build
```

## Notes

- Caddy will issue HTTPS certificates automatically when DNS is correct and ports `80/443` are open.
- The API is intentionally mounted behind `/api/*` on the same domain.
- This is a preview deployment for iterative development, not the final production topology.
