# Architecture Overview

## Monorepo

- `apps/web` renders user-facing clients
- `apps/api` owns HTTP APIs and orchestration boundaries
- `apps/worker` executes imports, enrichment, and other background jobs
- `packages/domain` holds domain contracts and shared types
- `packages/telegram` holds Telegram-specific helpers and adapters

## Bounded Contexts

- Auth
- Telegram
- Imports
- Library
- Catalog
- Playlists
- Tags
- Playback
- Backup Channels

## Design Constraints

- No in-memory auth or cache assumptions for production-critical flows
- No cross-import from one runtime app into another runtime app
- External data providers must implement adapter contracts
- Long-running workflows must be idempotent and job-driven
