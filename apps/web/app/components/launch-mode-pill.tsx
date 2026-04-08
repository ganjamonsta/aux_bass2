"use client";

import { useEffect, useState } from "react";

import {
  getTelegramLaunchContext,
  type TelegramLaunchContext,
} from "@aux-player/telegram";

const defaultContext: TelegramLaunchContext = {
  initData: null,
  isTelegramMiniApp: false,
  platform: null,
  version: null,
};

export function LaunchModePill() {
  const [launchContext, setLaunchContext] =
    useState<TelegramLaunchContext>(defaultContext);

  useEffect(() => {
    setLaunchContext(getTelegramLaunchContext());
  }, []);

  const modeLabel = launchContext.isTelegramMiniApp
    ? "Telegram Mini App"
    : "Web fallback";

  const environmentLabel = launchContext.platform
    ? `${launchContext.platform}${launchContext.version ? ` • v${launchContext.version}` : ""}`
    : "Browser session";

  return (
    <div className="context-card">
      <strong>Launch mode</strong>
      <span>{modeLabel}</span>
      <small>{environmentLabel}</small>
    </div>
  );
}