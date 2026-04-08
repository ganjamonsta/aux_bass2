import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface TelegramIdentitySnapshot {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  languageCode: string | null;
  photoUrl: string | null;
  isPremium: boolean;
}

export interface TelegramLoginPayload {
  id: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  authDate: number;
  hash: string;
}

export interface TelegramValidationOptions {
  maxAgeSeconds?: number;
  now?: Date;
}

export interface VerifiedTelegramMiniAppAuth {
  authDate: number;
  queryId: string | null;
  startParam: string | null;
  user: TelegramIdentitySnapshot;
}

export interface VerifiedTelegramLoginAuth {
  authDate: number;
  user: TelegramIdentitySnapshot;
}

const DEFAULT_MAX_AGE_SECONDS = 24 * 60 * 60;

interface TelegramUserLike {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

function buildDataCheckString(entries: Iterable<[string, string]>): string {
  return Array.from(entries)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function assertFresh(authDate: number, options?: TelegramValidationOptions): void {
  const maxAgeSeconds = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const nowSeconds = Math.floor((options?.now ?? new Date()).getTime() / 1000);

  if (authDate > nowSeconds + 30) {
    throw new Error("Telegram auth payload is dated in the future.");
  }

  if (nowSeconds - authDate > maxAgeSeconds) {
    throw new Error("Telegram auth payload is too old.");
  }
}

function compareHexDigests(expectedHex: string, actualHex: string): boolean {
  if (expectedHex.length !== actualHex.length) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(expectedHex, "hex");
    const actualBuffer = Buffer.from(actualHex, "hex");

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

function normalizeTelegramUser(user: TelegramUserLike): TelegramIdentitySnapshot {
  if (!user.first_name) {
    throw new Error("Telegram auth payload is missing first_name.");
  }

  return {
    id: String(user.id),
    firstName: user.first_name,
    isPremium: user.is_premium ?? false,
    languageCode: user.language_code ?? null,
    lastName: user.last_name ?? null,
    photoUrl: user.photo_url ?? null,
    username: user.username ?? null,
  };
}

export function verifyTelegramMiniAppInitData(
  initData: string,
  botToken: string,
  options?: TelegramValidationOptions,
): VerifiedTelegramMiniAppAuth {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const authDateRaw = params.get("auth_date");
  const rawUser = params.get("user");

  if (!hash || !authDateRaw || !rawUser) {
    throw new Error("Telegram Mini App payload is missing required fields.");
  }

  const authDate = Number.parseInt(authDateRaw, 10);

  if (!Number.isFinite(authDate)) {
    throw new Error("Telegram Mini App auth_date is invalid.");
  }

  const dataCheckString = buildDataCheckString(
    Array.from(params.entries()).filter(([key]) => key !== "hash"),
  );
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const digest = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (!compareHexDigests(digest, hash)) {
    throw new Error("Telegram Mini App signature verification failed.");
  }

  assertFresh(authDate, options);

  return {
    authDate,
    queryId: params.get("query_id"),
    startParam: params.get("start_param"),
    user: normalizeTelegramUser(JSON.parse(rawUser) as TelegramUserLike),
  };
}

export function verifyTelegramLoginPayload(
  payload: TelegramLoginPayload,
  botToken: string,
  options?: TelegramValidationOptions,
): VerifiedTelegramLoginAuth {
  if (!payload.hash) {
    throw new Error("Telegram login payload is missing hash.");
  }

  const normalizedEntries: Array<[string, string]> = [
    ["auth_date", String(payload.authDate)],
    ["first_name", payload.firstName],
    ["id", String(payload.id)],
  ];

  if (payload.lastName) {
    normalizedEntries.push(["last_name", payload.lastName]);
  }

  if (payload.photoUrl) {
    normalizedEntries.push(["photo_url", payload.photoUrl]);
  }

  if (payload.username) {
    normalizedEntries.push(["username", payload.username]);
  }

  const dataCheckString = buildDataCheckString(normalizedEntries);
  const secretKey = createHash("sha256").update(botToken).digest();
  const digest = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (!compareHexDigests(digest, payload.hash)) {
    throw new Error("Telegram login widget signature verification failed.");
  }

  assertFresh(payload.authDate, options);

  return {
    authDate: payload.authDate,
    user: {
      id: String(payload.id),
      firstName: payload.firstName,
      isPremium: false,
      languageCode: null,
      lastName: payload.lastName ?? null,
      photoUrl: payload.photoUrl ?? null,
      username: payload.username ?? null,
    },
  };
}