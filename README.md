# AUX Player

Greenfield rewrite of TG Player as a TypeScript monorepo.

## Stack

- Next.js App Router for Telegram-first web clients
- NestJS for API and orchestration
- Dedicated worker app for imports, enrichment, and background jobs
- Shared domain and Telegram packages for cross-app contracts

## Workspace Layout

- `apps/web` — Next.js client
- `apps/api` — NestJS API
- `apps/worker` — background worker process
- `packages/domain` — core domain contracts and types
- `packages/telegram` — Telegram WebApp integration helpers
- `docs` — product and architecture source of truth

## First Steps

1. Copy `.env.example` to `.env` and fill required values.
2. Run `npm install` in the repository root.
3. Use `npm run dev:web`, `npm run dev:api`, and `npm run dev:worker` during local development.

## Preview

- Local preview: run `npm run dev:web` and open `http://localhost:3000`
- Server preview with domain: follow `docs/03-preview-and-deploy.md`

## Current Status

This repository currently contains the bootstrap foundation for the rewrite: monorepo config, shared packages, initial apps, and architecture documentation.
