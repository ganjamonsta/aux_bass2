export const APP_NAME = "AUX Player";

export type ImportSourceKind =
  | "telegram-export"
  | "telegram-bot-upload"
  | "local-file"
  | "public-link";

export const IMPORT_SOURCE_LABELS: Record<ImportSourceKind, string> = {
  "telegram-export": "Telegram export",
  "telegram-bot-upload": "Telegram bot upload",
  "local-file": "Local files",
  "public-link": "Public links",
};

export interface ImportRequest {
  id: string;
  source: ImportSourceKind;
  requestedAt: string;
  userId: string;
}

export type PlaybackMode = "queue" | "shuffle" | "album" | "playlist";
