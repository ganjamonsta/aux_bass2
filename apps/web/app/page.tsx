import { createBootstrapManifest } from "@aux-player/domain";

import { LaunchModePill } from "./components/launch-mode-pill";

export default function HomePage() {
  const manifest = createBootstrapManifest();

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Foundation release</span>
          <h1>{manifest.appName}</h1>
          <p className="lead">{manifest.tagline}</p>
          <p className="lead lead-secondary">
            The bootstrap layer is now centered on stable contracts for imports,
            library entities, playback state, and runtime boundaries.
          </p>
        </div>
        <div className="hero-meta">
          <LaunchModePill />
          <article className="panel compact-panel">
            <h2>What is live now</h2>
            <ul>
              <li>Shared domain contracts for import, library, and playback flows</li>
              <li>API endpoints for service health and bootstrap manifest</li>
              <li>Worker startup payload aligned with the same shared contracts</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="grid grid-three">
        {manifest.services.map((service) => (
          <article className="panel" key={service.id}>
            <span className="panel-kicker">{service.id}</span>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <strong>Default port: {service.defaultPort}</strong>
          </article>
        ))}
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Bounded contexts</h2>
          <ul>
            {manifest.boundedContexts.map((context) => (
              <li key={context}>{context}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>First import adapters</h2>
          <ul>
            {manifest.firstWaveImportSources.map((source) => (
              <li key={source.id}>{source.label}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel principles-panel">
        <h2>Architecture principles</h2>
        <div className="principle-list">
          {manifest.architecturePrinciples.map((principle) => (
            <p key={principle}>{principle}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
