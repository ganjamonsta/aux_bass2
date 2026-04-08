import {
  createBootstrapManifest,
  createRuntimeHealthSnapshot,
} from "@aux-player/domain";

const WORKER_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

function bootstrap() {
  const health = createRuntimeHealthSnapshot("worker");
  const manifest = createBootstrapManifest();

  console.log(
    JSON.stringify({
      ...health,
      status: "bootstrapped",
      boundedContexts: manifest.boundedContexts,
      firstWaveImportSources: manifest.firstWaveImportSources,
    }),
  );

  const heartbeat = setInterval(() => {
    console.log(
      JSON.stringify({
        ...createRuntimeHealthSnapshot("worker"),
        status: "idle",
      }),
    );
  }, WORKER_HEARTBEAT_INTERVAL_MS);

  const shutdown = (signal: NodeJS.Signals) => {
    clearInterval(heartbeat);

    console.log(
      JSON.stringify({
        ...createRuntimeHealthSnapshot("worker"),
        status: "stopping",
        signal,
      }),
    );

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap();
