# Architecture Overview

## Monorepo

- `apps/web` renders user-facing clients
- `apps/api` owns HTTP APIs and orchestration boundaries
- `apps/worker` executes imports, enrichment, and other background jobs
- `packages/domain` holds domain contracts and shared types
- `packages/telegram` holds Telegram-specific helpers and adapters

## Bootstrap Runtime Surface

- `packages/domain` defines the first shared contracts for import workflows, library summaries, playlists, playback sessions, and runtime health
- `apps/api` currently exposes bootstrap discovery endpoints: `GET /health` and `GET /bootstrap`
- `apps/web` consumes the same manifest and detects Telegram launch mode on the client side
- `apps/worker` starts from the same bootstrap manifest to keep runtime boundaries aligned

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

## First-Wave Import Sources

- Telegram export
- Telegram bot upload
- Local files
- Public links

## Design Constraints

- No in-memory auth or cache assumptions for production-critical flows
- No cross-import from one runtime app into another runtime app
- External data providers must implement adapter contracts
- Long-running workflows must be idempotent and job-driven
