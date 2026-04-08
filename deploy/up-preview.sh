#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${SCRIPT_DIR}/compose-preview.sh" up -d --build

# Repeated preview rebuilds leave dangling <none> images behind.
# Prune only untagged images so we do not touch active containers.
docker image prune -f >/dev/null || true
