import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module.js";
import { BootstrapModule } from "./bootstrap/bootstrap.module.js";
import { HealthModule } from "./health/health.module.js";

@Module({
  imports: [AuthModule, BootstrapModule, HealthModule],
})
export class AppModule {}
