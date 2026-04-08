import "reflect-metadata";

import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { getClientOrigin } from "./config/runtime-config.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: getClientOrigin(),
    },
  });

  app.use(cookieParser());
  app.setGlobalPrefix("api");

  const port = Number.parseInt(process.env.API_PORT ?? "4000", 10);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();

