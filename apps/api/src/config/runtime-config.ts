export const SESSION_COOKIE_NAME = "aux_player_session";

const DEFAULT_CLIENT_ORIGIN = "http://localhost:3000";
const DEFAULT_SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getClientOrigin(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_CLIENT_ORIGIN;

  return new URL(rawUrl).origin;
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