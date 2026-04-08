import { Module } from "@nestjs/common";

import { BootstrapModule } from "./bootstrap/bootstrap.module.js";
import { HealthModule } from "./health/health.module.js";

@Module({
  imports: [BootstrapModule, HealthModule],
})
export class AppModule {}
