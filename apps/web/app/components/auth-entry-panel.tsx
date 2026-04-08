"use client";

import { useEffect, useRef, useState } from "react";

import type {
  AuthSessionStatus,
  TelegramLoginAuthExchangeRequest,
} from "@aux-player/domain";
import { getTelegramLaunchContext, type TelegramLaunchContext } from "@aux-player/telegram";

const defaultContext: TelegramLaunchContext = {
  initData: null,
  isTelegramMiniApp: false,
  platform: null,
  version: null,
};

type Phase = "loading" | "ready" | "signing-in" | "logging-out" | "error";

interface TelegramWidgetUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onAuxPlayerTelegramAuth?: (user: TelegramWidgetUser) => void;
  }
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/$/, "");
}

function mapTelegramWidgetUser(user: TelegramWidgetUser): TelegramLoginAuthExchangeRequest {
  return {
    authDate: user.auth_date,
    firstName: user.first_name,
    hash: user.hash,
    id: String(user.id),
    lastName: user.last_name ?? null,
    photoUrl: user.photo_url ?? null,
    username: user.username ?? null,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    return `Request failed with status ${response.status}.`;
  }

  return `Request failed with status ${response.status}.`;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

export function AuthEntryPanel() {
  const [launchContext, setLaunchContext] = useState<TelegramLaunchContext>(defaultContext);
  const [sessionStatus, setSessionStatus] = useState<AuthSessionStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const widgetHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const context = getTelegramLaunchContext();

    setLaunchContext(context);

    void bootstrap(context);
  }, []);

  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();
    const widgetHost = widgetHostRef.current;

    if (
      !widgetHost ||
      launchContext.isTelegramMiniApp ||
      phase !== "ready" ||
      sessionStatus?.status === "authenticated" ||
      !botUsername
    ) {
      return;
    }

    widgetHost.innerHTML = "";
    window.onAuxPlayerTelegramAuth = (user) => {
      void exchangeTelegramLogin(mapTelegramWidgetUser(user));
    };

    const script = document.createElement("script");

    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?23";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onAuxPlayerTelegramAuth(user)");

    widgetHost.appendChild(script);

    return () => {
      widgetHost.innerHTML = "";
      delete window.onAuxPlayerTelegramAuth;
    };
  }, [launchContext.isTelegramMiniApp, phase, sessionStatus]);

  async function bootstrap(context: TelegramLaunchContext) {
    setErrorMessage(null);
    setPhase("loading");

    try {
      const nextStatus =
        context.isTelegramMiniApp && context.initData
          ? await fetchJson<AuthSessionStatus>(`${getApiBaseUrl()}/auth/telegram-mini-app`, {
              body: JSON.stringify({ initData: context.initData }),
              headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
            })
          : await fetchJson<AuthSessionStatus>(`${getApiBaseUrl()}/auth/session`);

      setSessionStatus(nextStatus);
      setPhase("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to restore auth state.");
      setPhase("error");
    }
  }

  async function exchangeTelegramLogin(payload: TelegramLoginAuthExchangeRequest) {
    setErrorMessage(null);
    setPhase("signing-in");

    try {
      const nextStatus = await fetchJson<AuthSessionStatus>(`${getApiBaseUrl()}/auth/telegram-login`, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      setSessionStatus(nextStatus);
      setPhase("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Telegram login failed.");
      setPhase("error");
    }
  }

  async function logout() {
    setErrorMessage(null);
    setPhase("logging-out");

    try {
      const nextStatus = await fetchJson<AuthSessionStatus>(`${getApiBaseUrl()}/auth/logout`, {
        method: "POST",
      });

      setSessionStatus(nextStatus);
      setPhase("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to log out.");
      setPhase("error");
    }
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() ?? "";
  const actor = sessionStatus?.status === "authenticated" ? sessionStatus.actor : null;

  return (
    <article className="panel auth-panel">
      <div className="auth-panel-header">
        <h2>Session</h2>
        <span className={`auth-badge auth-badge-${phase}`}>
          {phase === "loading" && "Restoring"}
          {phase === "signing-in" && "Signing in"}
          {phase === "logging-out" && "Signing out"}
          {phase === "ready" && (actor ? "Active" : "Signed out")}
          {phase === "error" && "Needs attention"}
        </span>
      </div>

      {actor ? (
        <>
          <p className="auth-copy">
            Signed in as <strong>{actor.user.displayName}</strong>
            {actor.user.username ? ` (@${actor.user.username})` : ""}.
          </p>
          <p className="auth-copy auth-copy-secondary">
            Provider: {actor.session.provider}. Expires: {new Date(actor.session.expiresAt).toLocaleString()}.
          </p>
          <div className="action-row">
            <button className="action-button" onClick={() => void logout()} type="button">
              Log out
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="auth-copy">
            {launchContext.isTelegramMiniApp
              ? "Mini App mode detected. Session exchange will happen from Telegram initData."
              : "Browser mode is active. Use Telegram login to establish the same server session model."}
          </p>
          <p className="auth-copy auth-copy-secondary">
            The API now issues cookie-backed sessions persisted in Postgres and exposes them via /api/auth/session.
          </p>
          {!launchContext.isTelegramMiniApp && botUsername ? (
            <div className="widget-host" ref={widgetHostRef} />
          ) : null}
          {!launchContext.isTelegramMiniApp && !botUsername ? (
            <p className="auth-note">
              Set NEXT_PUBLIC_TELEGRAM_BOT_USERNAME to render the browser login widget.
            </p>
          ) : null}
        </>
      )}

      {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
    </article>
  );
}