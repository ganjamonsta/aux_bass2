import { Module } from "@nestjs/common";

import { PrismaModule } from "../persistence/prisma.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthGuard, AuthService],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}