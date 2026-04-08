#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

docker compose \
  --env-file "${ROOT_DIR}/.env" \
  -f "${SCRIPT_DIR}/docker-compose.preview.yml" \
  up -d --build
