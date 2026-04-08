import {
  createBootstrapManifest,
  createRuntimeHealthSnapshot,
} from "@aux-player/domain";

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
}

bootstrap();
