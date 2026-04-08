import { APP_NAME } from "@aux-player/domain";

function bootstrap() {
  const startedAt = new Date().toISOString();

  console.log(
    JSON.stringify({
      service: `${APP_NAME} Worker`,
      status: "bootstrapped",
      startedAt,
    }),
  );
}

bootstrap();
