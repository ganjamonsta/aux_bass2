# AUX Player — Copilot Instructions

## Architecture Direction

This repository is a greenfield rewrite of TG Player.

- Frontend: Next.js App Router + TypeScript
- Backend: NestJS + TypeScript
- Background jobs: dedicated worker app
- Shared contracts: packages under `packages/`
- Product focus: Telegram-first, but must keep a normal web mode

## Engineering Rules

- Keep package boundaries strict. Shared packages must not import app runtime code.
- Treat Telegram as an integration layer, not the only storage backend.
- Avoid mixing file storage identity, canonical music identity, and user ownership in one model.
- Design all external sources through adapters with normalized DTOs.
- Heavy work belongs in jobs and workers, not request handlers.
- Prefer typed contracts in `packages/domain` for data crossing app boundaries.

## Initial Product Priorities

- Import Telegram chat exports and other user-provided media sources
- Personal library and playlist management
- Playback queue, shuffle, and downloads
- Telegram Mini App shell and full web fallback
- HD asset handling with streamable fallback
- Backup channel integration as a separate bounded context

## Near-Term Implementation Focus

- Build stable domain contracts before deep feature work
- Add infra modules incrementally: auth, imports, library, playback
- Keep docs in `docs/` aligned with implementation decisions
