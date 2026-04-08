# AUX Player

Greenfield rewrite of TG Player as a TypeScript monorepo.

## Stack

- Next.js App Router for Telegram-first web clients
- NestJS for API and orchestration
- Dedicated worker app for imports, enrichment, and background jobs
- Shared domain and Telegram packages for cross-app contracts

## Bootstrap Scope

- Shared contracts for import requests, library summaries, playlists, playback queue, and runtime health
- `apps/api` exposes `GET /health` and `GET /bootstrap`
- `apps/web` renders a bootstrap landing page that detects Telegram Mini App launch mode on the client
- `apps/worker` starts with the same bootstrap manifest used by web and api

## Workspace Layout

- `apps/web` — Next.js client
- `apps/api` — NestJS API
- `apps/worker` — background worker process
- `packages/domain` — core domain contracts and types
- `packages/telegram` — Telegram WebApp integration helpers
- `docs` — product and architecture source of truth

## Local Commands

- `npm run dev:web` — Next.js web app on `http://localhost:3000`
- `npm run dev:api` — NestJS API on `http://localhost:4000`
- `npm run dev:worker` — worker process in watch mode
- `npm run typecheck` — run TypeScript validation across the monorepo
- `npm run build` — build all apps and shared packages through Turborepo

## First Steps

1. Copy `.env.example` to `.env` and fill required values.
2. Run `npm install` in the repository root.
3. Use `npm run dev:web`, `npm run dev:api`, and `npm run dev:worker` during local development.

## Bootstrap Endpoints

- `GET /health` — typed runtime health snapshot for the API process
- `GET /bootstrap` — current bootstrap manifest with bounded contexts, runtime services, and first-wave import sources

## Preview

- Local preview: run `npm run dev:web` and open `http://localhost:3000`
- Server preview with domain: follow `docs/03-preview-and-deploy.md`

## Current Status

This repository now contains the first coherent foundation for the rewrite: monorepo config, shared domain contracts, initial app runtimes, and architecture documentation aligned to the bootstrap layer.
