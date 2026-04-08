#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "${SCRIPT_DIR}"

if docker compose version >/dev/null 2>&1; then
  docker compose -f docker-compose.host-nginx.yml up -d --build
  docker image prune -f >/dev/null || true
  exit 0
fi

if command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f docker-compose.host-nginx.yml up -d --build
  docker image prune -f >/dev/null || true
  exit 0
fi

echo "Neither 'docker compose' nor 'docker-compose' is available on this server." >&2
exit 1
