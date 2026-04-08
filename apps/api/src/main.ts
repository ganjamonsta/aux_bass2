import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix("api");

  const port = Number.parseInt(process.env.API_PORT ?? "4000", 10);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();

