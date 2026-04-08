export const APP_NAME = "AUX Player";

export const APP_TAGLINE =
  "Telegram-first music library rewrite with a full web fallback.";

export const ARCHITECTURE_PRINCIPLES = [
  "Shared contracts define boundaries before runtime modules grow deeper.",
  "External sources integrate through adapters with normalized DTOs.",
  "Heavy import and enrichment work stays in jobs and workers.",
  "Telegram is an integration channel, not the canonical storage model.",
] as const;

export const BOUNDED_CONTEXTS = [
  "auth",
  "telegram",
  "imports",
  "library",
  "catalog",
  "playlists",
  "playback",
  "backup-channels",
] as const;

export type BoundedContext = (typeof BOUNDED_CONTEXTS)[number];

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

export const FIRST_WAVE_IMPORT_SOURCES: readonly ImportSourceKind[] = [
  "telegram-export",
  "telegram-bot-upload",
  "local-file",
  "public-link",
];

export type RuntimeServiceId = "web" | "api" | "worker";

export interface RuntimeServiceDescriptor {
  id: RuntimeServiceId;
  name: string;
  description: string;
  defaultPort: number;
}

export const RUNTIME_SERVICE_LIST: readonly RuntimeServiceDescriptor[] = [
  {
    id: "web",
    name: "Web App",
    description: "Next.js shell for Telegram Mini App and standard browser sessions.",
    defaultPort: 3000,
  },
  {
    id: "api",
    name: "API",
    description: "NestJS orchestration layer for app boundaries and future auth/import flows.",
    defaultPort: 4000,
  },
  {
    id: "worker",
    name: "Worker",
    description: "Background runtime for imports, enrichment, and other job-driven workflows.",
    defaultPort: 4010,
  },
];

export type ImportJobStage =
  | "received"
  | "normalized"
  | "deduplicated"
  | "enriched"
  | "stored"
  | "completed"
  | "failed";

export interface ImportRequest {
  id: string;
  source: ImportSourceKind;
  requestedAt: string;
  userId: string;
  sourceReference?: string;
}

export interface ImportJobSummary extends ImportRequest {
  stage: ImportJobStage;
  trackCount: number;
}

export interface LibraryTrackSummary {
  id: string;
  canonicalTrackId: string;
  title: string;
  artistName: string;
  durationSeconds: number;
  importSource: ImportSourceKind;
  streamable: boolean;
}

export interface PlaylistSummary {
  id: string;
  ownerUserId: string;
  title: string;
  trackCount: number;
}

export type PlaybackMode = "queue" | "shuffle" | "album" | "playlist";

export interface PlaybackQueueItem {
  id: string;
  trackId: string;
  requestedByUserId: string;
  mode: PlaybackMode;
  queuedAt: string;
}

export interface PlaybackSession {
  id: string;
  mode: PlaybackMode;
  queue: PlaybackQueueItem[];
  activeTrackId: string | null;
}

export type AuthProvider = "telegram-mini-app" | "telegram-login-widget";

export type AuthLaunchMode = "telegram-mini-app" | "web";

export interface AuthUser {
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  telegramUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramIdentityProfile {
  id: string;
  telegramUserId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  languageCode: string | null;
  isPremium: boolean;
  lastAuthProvider: AuthProvider;
  lastAuthenticatedAt: string;
}

export interface AuthSession {
  id: string;
  tokenId: string;
  userId: string;
  provider: AuthProvider;
  launchMode: AuthLaunchMode;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface AuthenticatedActor {
  user: AuthUser;
  session: AuthSession;
  telegramIdentity: TelegramIdentityProfile | null;
}

export type AuthSessionStatus =
  | {
      status: "anonymous";
    }
  | {
      status: "authenticated";
      actor: AuthenticatedActor;
    };

export interface TelegramMiniAppAuthExchangeRequest {
  initData: string;
}

export interface TelegramLoginAuthExchangeRequest {
  id: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  authDate: number;
  hash: string;
}

export interface RuntimeHealthSnapshot {
  appName: string;
  serviceId: RuntimeServiceId;
  serviceName: string;
  status: "ok";
  timestamp: string;
  defaultPort: number;
}

export interface BootstrapManifest {
  appName: string;
  tagline: string;
  boundedContexts: readonly BoundedContext[];
  architecturePrinciples: readonly string[];
  firstWaveImportSources: ReadonlyArray<{
    id: ImportSourceKind;
    label: string;
  }>;
  services: readonly RuntimeServiceDescriptor[];
}

export function getRuntimeService(serviceId: RuntimeServiceId): RuntimeServiceDescriptor {
  const service = RUNTIME_SERVICE_LIST.find((candidate) => candidate.id === serviceId);

  if (!service) {
    throw new Error(`Unknown runtime service: ${serviceId}`);
  }

  return service;
}

export function createRuntimeHealthSnapshot(
  serviceId: RuntimeServiceId,
): RuntimeHealthSnapshot {
  const service = getRuntimeService(serviceId);

  return {
    appName: APP_NAME,
    serviceId,
    serviceName: service.name,
    status: "ok",
    timestamp: new Date().toISOString(),
    defaultPort: service.defaultPort,
  };
}

export function createBootstrapManifest(): BootstrapManifest {
  return {
    appName: APP_NAME,
    tagline: APP_TAGLINE,
    boundedContexts: BOUNDED_CONTEXTS,
    architecturePrinciples: ARCHITECTURE_PRINCIPLES,
    firstWaveImportSources: FIRST_WAVE_IMPORT_SOURCES.map((source) => ({
      id: source,
      label: IMPORT_SOURCE_LABELS[source],
    })),
    services: RUNTIME_SERVICE_LIST,
  };
}

export function createAnonymousAuthSessionStatus(): AuthSessionStatus {
  return {
    status: "anonymous",
  };
}

export function createAuthenticatedAuthSessionStatus(
  actor: AuthenticatedActor,
): AuthSessionStatus {
  return {
    status: "authenticated",
    actor,
  };
}
