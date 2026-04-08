# Product Brief

## Goal

Build a modern Telegram-first music library and player that can ingest user-owned music from Telegram chat exports, direct uploads, local files, and other approved sources.

## MVP

- Import user media into a normalized library
- Browse and search personal library
- Create and manage playlists
- Playback with queue and shuffle
- Download owned media
- Telegram Mini App support with full web fallback

## Principles

- User library is the center of the product
- External catalogs are adapters, not the core model
- Telegram integration must stay first-class but not define all architecture
- The domain model must separate ownership, media files, and canonical track identity
