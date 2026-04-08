export interface TelegramWebAppLike {
  initData?: string;
  platform?: string;
  version?: string;
}

export interface TelegramLaunchContext {
  initData: string | null;
  isTelegramMiniApp: boolean;
  platform: string | null;
  version: string | null;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppLike;
    };
  }
}

export function getTelegramWebApp(): TelegramWebAppLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp ?? null;
}

export function getTelegramLaunchContext(): TelegramLaunchContext {
  const webApp = getTelegramWebApp();

  return {
    initData: webApp?.initData ?? null,
    isTelegramMiniApp: webApp !== null,
    platform: webApp?.platform ?? null,
    version: webApp?.version ?? null,
  };
}