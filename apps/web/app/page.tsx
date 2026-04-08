import {
  APP_NAME,
  IMPORT_SOURCE_LABELS,
  type ImportSourceKind,
} from "@aux-player/domain";
import { getTelegramLaunchContext } from "@aux-player/telegram";

const firstWaveSources: ImportSourceKind[] = [
  "telegram-export",
  "telegram-bot-upload",
  "local-file",
  "public-link",
];

export default function HomePage() {
  const telegramContext = getTelegramLaunchContext();

  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">Greenfield bootstrap</span>
        <h1>{APP_NAME}</h1>
        <p className="lead">
          A Telegram-first music library rewrite with a full web mode, strict
          domain boundaries, and import-driven architecture.
        </p>
        <div className="context-card">
          <strong>Launch mode</strong>
          <span>{telegramContext.isTelegramMiniApp ? "Telegram Mini App" : "Web fallback"}</span>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Implementation focus</h2>
          <ul>
            <li>Normalize imported media into a durable library model</li>
            <li>Keep playback and queue logic independent from import workflows</li>
            <li>Use shared contracts instead of app-to-app runtime imports</li>
          </ul>
        </article>

        <article className="panel">
          <h2>First import adapters</h2>
          <ul>
            {firstWaveSources.map((source) => (
              <li key={source}>{IMPORT_SOURCE_LABELS[source]}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
