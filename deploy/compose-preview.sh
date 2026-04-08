#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${ROOT_DIR}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "${ROOT_DIR}/.env"
  set +a
fi

if docker compose version >/dev/null 2>&1; then
  docker compose -f "${SCRIPT_DIR}/docker-compose.preview.yml" "$@"
  exit 0
fi

if command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f "${SCRIPT_DIR}/docker-compose.preview.yml" "$@"
  exit 0
fi

echo "Neither 'docker compose' nor 'docker-compose' is available on this server." >&2
echo "Install docker-compose or the Docker Compose plugin and retry." >&2
exit 1
