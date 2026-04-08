# GanjaCraft Server Preview

## Target

- Domain: `aux.ganj4craft.ru`
- Server OS: Debian 12
- User: `ganjamonsta`
- Repository: `https://github.com/ganjamonsta/aux_bass2`
- App location: `/opt/aux_bass2`

## DNS

Before deploy, point the `A` record for `aux.ganj4craft.ru` to your server IP.

## 1. Prepare The Server

SSH into the server and create the app directory:

```bash
ssh ganjamonsta@YOUR_SERVER_IP
sudo mkdir -p /opt/aux_bass2
sudo chown -R ganjamonsta:ganjamonsta /opt/aux_bass2
```

Check Docker availability:

```bash
docker --version
docker compose version || docker-compose --version
```

If Docker is missing, install it first. If `docker compose` is unavailable but `docker-compose` is also missing, install `docker-compose` on Debian:

```bash
sudo apt-get update
sudo apt-get install -y docker-compose
```

## 2. Clone The Project

On the server:

```bash
cd /opt
git clone https://github.com/ganjamonsta/aux_bass2.git aux_bass2
```

If the directory already exists and it is already a git checkout, update it with:

```bash
cd /opt/aux_bass2
git pull
```

## 3. Create Environment File

On the server:

```bash
cd /opt/aux_bass2
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
cd /opt/aux_bass2
bash deploy/up-preview.sh
```

## 5. Verify

Check containers:

```bash
cd /opt/aux_bass2
bash deploy/compose-preview.sh ps
```

Check logs if needed:

```bash
bash deploy/compose-preview.sh logs -f caddy web api
```

Open these URLs:

- `https://aux.ganj4craft.ru`
- `https://aux.ganj4craft.ru/api/health`

## 6. Updating Later

When you change the code:

```bash
cd /opt/aux_bass2
git pull
bash deploy/up-preview.sh
```

## Notes

- Caddy will issue HTTPS certificates automatically when DNS is correct and ports `80/443` are open.
- The API is intentionally mounted behind `/api/*` on the same domain.
- This is a preview deployment for iterative development, not the final production topology.
