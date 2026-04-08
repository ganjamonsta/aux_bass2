import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  createAnonymousAuthSessionStatus,
  createAuthenticatedAuthSessionStatus,
  type AuthenticatedActor,
  type TelegramLoginAuthExchangeRequest,
  type TelegramMiniAppAuthExchangeRequest,
} from "@aux-player/domain";
import type { Request, Response } from "express";

import { SESSION_COOKIE_NAME } from "../config/runtime-config.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { CurrentActor } from "./current-actor.decorator.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("telegram-mini-app")
  async exchangeTelegramMiniApp(
    @Body() body: TelegramMiniAppAuthExchangeRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const exchange = await this.authService.exchangeTelegramMiniApp(body?.initData);

    response.cookie(
      SESSION_COOKIE_NAME,
      exchange.token,
      this.authService.getSessionCookieOptions(),
    );

    return exchange.status;
  }

  @Post("telegram-login")
  async exchangeTelegramLogin(
    @Body() body: TelegramLoginAuthExchangeRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const exchange = await this.authService.exchangeTelegramLogin(body);

    response.cookie(
      SESSION_COOKIE_NAME,
      exchange.token,
      this.authService.getSessionCookieOptions(),
    );

    return exchange.status;
  }

  @Get("session")
  async getSession(@Req() request: Request) {
    return this.authService.resolveSessionFromRequest(request);
  }

  @Get("actor")
  @UseGuards(AuthGuard)
  getActor(@CurrentActor() actor: AuthenticatedActor) {
    return createAuthenticatedAuthSessionStatus(actor);
  }

  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.revokeSessionFromRequest(request);

    response.clearCookie(
      SESSION_COOKIE_NAME,
      this.authService.getSessionCookieOptions(),
    );

    return createAnonymousAuthSessionStatus();
  }
}