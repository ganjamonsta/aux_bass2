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

`NEXT_PUBLIC_APP_URL` must be a full absolute URL with protocol. `https://aux.ganj4craft.ru` is valid, `aux.ganj4craft.ru` is not.

Telegram sign-in in the current preview also requires:

- `TELEGRAM_BOT_TOKEN`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`

If you want the Mini App to open from the bot itself, the bot must expose the app through a Telegram `web_app` button or menu button. Opening the site as a plain link inside Telegram will not provide Mini App `initData`, so automatic Telegram auth cannot happen.

The deploy stack uses public ECR image mirrors instead of Docker Hub because Docker Hub pulls may be blocked from your server region.

## 4. Start The Preview Stack

On the server:

```bash
cd /opt/aux_bass2
bash deploy/up-preview.sh
```

If `80/443` are already occupied by your old player install or by host nginx, use the host-nginx mode instead:

```bash
cd /opt/aux_bass2
bash deploy/up-host-nginx-preview.sh
```

This mode publishes:

- web on `127.0.0.1:3100`
- api on `127.0.0.1:4100`

and expects your host nginx to proxy `aux.ganj4craft.ru` to those local ports.

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

## 5.1 Host Nginx Switch-Over

If an old install already owns `443`, keep nginx on the host and swap its upstream instead of starting Caddy in Docker.

1. Start the localhost-only stack:

```bash
cd /opt/aux_bass2
bash deploy/up-host-nginx-preview.sh
```

1. Install the provided nginx config template:

```bash
sudo cp /opt/aux_bass2/deploy/nginx.aux-player-preview.conf /etc/nginx/sites-available/aux.ganj4craft.ru.conf
```

1. Adjust certificate paths if your server stores them elsewhere.

1. Enable the site and reload nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/aux.ganj4craft.ru.conf /etc/nginx/sites-enabled/aux.ganj4craft.ru.conf
sudo nginx -t
sudo systemctl reload nginx
```

1. If the old player still has its own enabled site for the same domain, disable that old site before reloading nginx.

The most likely conflicting site on this server is `tgplayer.conf`, because it also declares `server_name aux.ganj4craft.ru`.

1. Verify the new containers directly before testing the public domain:

```bash
curl -I http://127.0.0.1:3100/
curl http://127.0.0.1:4100/api/health
```

If localhost works but the public domain still returns `404`, the remaining problem is your active nginx site configuration rather than the containers.

## 6. Updating Later

When you change the code:

```bash
cd /opt/aux_bass2
git pull
bash deploy/up-preview.sh
```

If you are using host-nginx mode:

```bash
cd /opt/aux_bass2
git pull
bash deploy/up-host-nginx-preview.sh
sudo nginx -t
sudo systemctl reload nginx
```

## Notes

- Caddy will issue HTTPS certificates automatically when DNS is correct and ports `80/443` are open.
- The API is intentionally mounted behind `/api/*` on the same domain.
- This is a preview deployment for iterative development, not the final production topology.
- Preview deploy scripts prune dangling Docker images after successful rebuilds, which helps avoid disk exhaustion on the 10 GB server.
