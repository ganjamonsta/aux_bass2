export const SESSION_COOKIE_NAME = "aux_player_session";

const DEFAULT_CLIENT_ORIGIN = "http://localhost:3000";
const DEFAULT_SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

function hasUrlScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(value);
}

function inferUrlScheme(value: string): string {
  if (value.startsWith("localhost") || value.startsWith("127.0.0.1")) {
    return `http://${value}`;
  }

  return `https://${value}`;
}

function resolveAppUrl(rawUrl: string): URL {
  const candidate = rawUrl.trim();

  try {
    return new URL(candidate);
  } catch {
    const normalized = hasUrlScheme(candidate) ? candidate : inferUrlScheme(candidate);

    try {
      console.warn(
        `NEXT_PUBLIC_APP_URL did not include a valid absolute URL, using normalized value: ${normalized}`,
      );

      return new URL(normalized);
    } catch {
      console.warn(
        `NEXT_PUBLIC_APP_URL is invalid (${candidate}). Falling back to ${DEFAULT_CLIENT_ORIGIN}.`,
      );

      return new URL(DEFAULT_CLIENT_ORIGIN);
    }
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getClientOrigin(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_CLIENT_ORIGIN;

  return resolveAppUrl(rawUrl).origin;
}

export function getAuthRuntimeConfig() {
  const clientOrigin = getClientOrigin();
  const sessionDurationSeconds = Number.parseInt(
    process.env.AUTH_SESSION_DURATION_SECONDS ?? String(DEFAULT_SESSION_DURATION_SECONDS),
    10,
  );

  if (!Number.isFinite(sessionDurationSeconds) || sessionDurationSeconds <= 0) {
    throw new Error("AUTH_SESSION_DURATION_SECONDS must be a positive integer.");
  }

  return {
    clientOrigin,
    jwtSecret: requireEnv("JWT_SECRET"),
    sessionDurationSeconds,
    telegramBotToken: requireEnv("TELEGRAM_BOT_TOKEN"),
    useSecureCookies: clientOrigin.startsWith("https://"),
  };
}