import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  AuthProvider as PrismaAuthProvider,
  SessionLaunchMode as PrismaSessionLaunchMode,
  type AuthSession as PrismaAuthSessionRecord,
  type TelegramIdentity as PrismaTelegramIdentityRecord,
  type User as PrismaUserRecord,
} from "@prisma/client";
import {
  createAnonymousAuthSessionStatus,
  createAuthenticatedAuthSessionStatus,
  type AuthLaunchMode,
  type AuthProvider,
  type AuthSessionStatus,
  type AuthenticatedActor,
  type TelegramIdentityProfile,
  type TelegramLoginAuthExchangeRequest,
} from "@aux-player/domain";
import {
  errors as joseErrors,
  jwtVerify,
  SignJWT,
  type JWTPayload,
} from "jose";
import type { CookieOptions, Request } from "express";

import {
  verifyTelegramLoginPayload,
  verifyTelegramMiniAppInitData,
} from "@aux-player/telegram/server";

import { getAuthRuntimeConfig, SESSION_COOKIE_NAME } from "../config/runtime-config.js";
import { PrismaService } from "../persistence/prisma.service.js";
import type { AuthenticatedRequest } from "./authenticated-request.js";

interface SessionJwtPayload extends JWTPayload {
  sid: string;
  sub: string;
  jti: string;
}

interface TelegramProfileInput {
  authDate: number;
  authProvider: AuthProvider;
  launchMode: AuthLaunchMode;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
    languageCode: string | null;
    photoUrl: string | null;
    isPremium: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async exchangeTelegramMiniApp(initData: string) {
    if (!initData?.trim()) {
      throw new BadRequestException("initData is required.");
    }

    const config = getAuthRuntimeConfig();

    try {
      const verified = verifyTelegramMiniAppInitData(initData, config.telegramBotToken);
      const actor = await this.issueActorFromTelegramProfile({
        authDate: verified.authDate,
        authProvider: "telegram-mini-app",
        launchMode: "telegram-mini-app",
        user: verified.user,
      });

      return {
        status: createAuthenticatedAuthSessionStatus(actor),
        token: await this.signSessionToken(actor),
      };
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : "Telegram Mini App auth failed.",
      );
    }
  }

  async exchangeTelegramLogin(payload: TelegramLoginAuthExchangeRequest) {
    if (!payload?.id || !payload.firstName || !payload.hash) {
      throw new BadRequestException("Telegram login payload is incomplete.");
    }

    const config = getAuthRuntimeConfig();

    try {
      const verified = verifyTelegramLoginPayload(payload, config.telegramBotToken);
      const actor = await this.issueActorFromTelegramProfile({
        authDate: verified.authDate,
        authProvider: "telegram-login-widget",
        launchMode: "web",
        user: verified.user,
      });

      return {
        status: createAuthenticatedAuthSessionStatus(actor),
        token: await this.signSessionToken(actor),
      };
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : "Telegram login auth failed.",
      );
    }
  }

  getSessionCookieOptions(): CookieOptions {
    const config = getAuthRuntimeConfig();

    return {
      httpOnly: true,
      maxAge: config.sessionDurationSeconds * 1000,
      path: "/",
      sameSite: "lax",
      secure: config.useSecureCookies,
    };
  }

  async resolveSessionFromRequest(request: Request): Promise<AuthSessionStatus> {
    const token = this.extractSessionToken(request);

    if (!token) {
      return createAnonymousAuthSessionStatus();
    }

    try {
      const actor = await this.resolveActorFromToken(token);

      return actor
        ? createAuthenticatedAuthSessionStatus(actor)
        : createAnonymousAuthSessionStatus();
    } catch {
      return createAnonymousAuthSessionStatus();
    }
  }

  async requireAuthenticatedActor(
    request: AuthenticatedRequest,
  ): Promise<AuthenticatedActor> {
    const token = this.extractSessionToken(request);

    if (!token) {
      throw new UnauthorizedException("Authentication required.");
    }

    const actor = await this.resolveActorFromToken(token);

    if (!actor) {
      throw new UnauthorizedException("Authentication required.");
    }

    return actor;
  }

  async revokeSessionFromRequest(request: Request): Promise<void> {
    const token = this.extractSessionToken(request);

    if (!token) {
      return;
    }

    try {
      const payload = await this.verifySessionToken(token);

      await this.prisma.authSession.updateMany({
        where: {
          id: payload.sid,
          revokedAt: null,
          tokenId: payload.jti,
          userId: payload.sub,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      return;
    }
  }

  private async issueActorFromTelegramProfile(
    profile: TelegramProfileInput,
  ): Promise<AuthenticatedActor> {
    const authenticatedAt = new Date(profile.authDate * 1000);
    const issuedAt = new Date();
    const config = getAuthRuntimeConfig();
    const expiresAt = new Date(issuedAt.getTime() + config.sessionDurationSeconds * 1000);
    const tokenId = randomUUID();

    const records = await this.prisma.$transaction(async (transaction) => {
      const existingIdentity = await transaction.telegramIdentity.findUnique({
        where: {
          telegramUserId: profile.user.id,
        },
        include: {
          user: true,
        },
      });

      const displayName = buildDisplayName(profile.user);

      let user: PrismaUserRecord;
      let identity: PrismaTelegramIdentityRecord;

      if (existingIdentity) {
        user = await transaction.user.update({
          where: {
            id: existingIdentity.userId,
          },
          data: {
            avatarUrl: profile.user.photoUrl,
            displayName,
            username: profile.user.username,
          },
        });

        identity = await transaction.telegramIdentity.update({
          where: {
            id: existingIdentity.id,
          },
          data: {
            firstName: profile.user.firstName,
            isPremium: profile.user.isPremium,
            languageCode: profile.user.languageCode,
            lastAuthenticatedAt: authenticatedAt,
            lastAuthProvider: toPrismaAuthProvider(profile.authProvider),
            lastName: profile.user.lastName,
            photoUrl: profile.user.photoUrl,
            username: profile.user.username,
          },
        });
      } else {
        user = await transaction.user.create({
          data: {
            avatarUrl: profile.user.photoUrl,
            displayName,
            username: profile.user.username,
          },
        });

        identity = await transaction.telegramIdentity.create({
          data: {
            firstName: profile.user.firstName,
            isPremium: profile.user.isPremium,
            languageCode: profile.user.languageCode,
            lastAuthenticatedAt: authenticatedAt,
            lastAuthProvider: toPrismaAuthProvider(profile.authProvider),
            lastName: profile.user.lastName,
            photoUrl: profile.user.photoUrl,
            telegramUserId: profile.user.id,
            userId: user.id,
            username: profile.user.username,
          },
        });
      }

      const session = await transaction.authSession.create({
        data: {
          authProvider: toPrismaAuthProvider(profile.authProvider),
          expiresAt,
          issuedAt,
          launchMode: toPrismaLaunchMode(profile.launchMode),
          lastSeenAt: issuedAt,
          tokenId,
          userId: user.id,
        },
      });

      return {
        identity,
        session,
        user,
      };
    });

    return {
      session: mapSession(records.session),
      telegramIdentity: mapTelegramIdentity(records.identity),
      user: mapUser(records.user, records.identity.telegramUserId),
    };
  }

  private async signSessionToken(actor: AuthenticatedActor): Promise<string> {
    const config = getAuthRuntimeConfig();

    return new SignJWT({
      sid: actor.session.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(new Date(actor.session.issuedAt))
      .setExpirationTime(new Date(actor.session.expiresAt))
      .setJti(actor.session.tokenId)
      .setSubject(actor.user.id)
      .sign(new TextEncoder().encode(config.jwtSecret));
  }

  private extractSessionToken(request: Request): string | null {
    const cookieToken = request.cookies?.[SESSION_COOKIE_NAME];

    if (typeof cookieToken === "string" && cookieToken.length > 0) {
      return cookieToken;
    }

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      return null;
    }

    return authorizationHeader.slice("Bearer ".length).trim() || null;
  }

  private async resolveActorFromToken(token: string): Promise<AuthenticatedActor | null> {
    let payload: SessionJwtPayload;

    try {
      payload = await this.verifySessionToken(token);
    } catch (error) {
      if (error instanceof joseErrors.JWTExpired) {
        return null;
      }

      throw error;
    }

    const session = await this.prisma.authSession.findUnique({
      where: {
        id: payload.sid,
      },
      include: {
        user: {
          include: {
            telegramIdentity: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    if (
      session.userId !== payload.sub ||
      session.tokenId !== payload.jti ||
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      return null;
    }

    await this.prisma.authSession.update({
      where: {
        id: session.id,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });

    return {
      session: mapSession(session),
      telegramIdentity: session.user.telegramIdentity
        ? mapTelegramIdentity(session.user.telegramIdentity)
        : null,
      user: mapUser(
        session.user,
        session.user.telegramIdentity?.telegramUserId ?? null,
      ),
    };
  }

  private async verifySessionToken(token: string): Promise<SessionJwtPayload> {
    const config = getAuthRuntimeConfig();
    const verification = await jwtVerify(token, new TextEncoder().encode(config.jwtSecret), {
      algorithms: ["HS256"],
    });
    const payload = verification.payload as SessionJwtPayload;

    if (!payload.sub || !payload.jti || !payload.sid) {
      throw new UnauthorizedException("Session token payload is invalid.");
    }

    return payload;
  }
}

function buildDisplayName(profile: TelegramProfileInput["user"]): string {
  const parts = [profile.firstName, profile.lastName].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  if (profile.username) {
    return `@${profile.username}`;
  }

  return `Telegram user ${profile.id}`;
}

function toPrismaAuthProvider(provider: AuthProvider): PrismaAuthProvider {
  return provider === "telegram-mini-app"
    ? PrismaAuthProvider.TELEGRAM_MINI_APP
    : PrismaAuthProvider.TELEGRAM_LOGIN_WIDGET;
}

function toPrismaLaunchMode(launchMode: AuthLaunchMode): PrismaSessionLaunchMode {
  return launchMode === "telegram-mini-app"
    ? PrismaSessionLaunchMode.TELEGRAM_MINI_APP
    : PrismaSessionLaunchMode.WEB_BROWSER;
}

function fromPrismaAuthProvider(provider: PrismaAuthProvider): AuthProvider {
  return provider === PrismaAuthProvider.TELEGRAM_MINI_APP
    ? "telegram-mini-app"
    : "telegram-login-widget";
}

function fromPrismaLaunchMode(launchMode: PrismaSessionLaunchMode): AuthLaunchMode {
  return launchMode === PrismaSessionLaunchMode.TELEGRAM_MINI_APP
    ? "telegram-mini-app"
    : "web";
}

function mapUser(
  user: PrismaUserRecord,
  telegramUserId: string | null,
): AuthenticatedActor["user"] {
  return {
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    displayName: user.displayName,
    id: user.id,
    telegramUserId,
    updatedAt: user.updatedAt.toISOString(),
    username: user.username,
  };
}

function mapSession(session: PrismaAuthSessionRecord): AuthenticatedActor["session"] {
  return {
    expiresAt: session.expiresAt.toISOString(),
    id: session.id,
    issuedAt: session.issuedAt.toISOString(),
    launchMode: fromPrismaLaunchMode(session.launchMode),
    provider: fromPrismaAuthProvider(session.authProvider),
    revokedAt: session.revokedAt?.toISOString() ?? null,
    tokenId: session.tokenId,
    userId: session.userId,
  };
}

function mapTelegramIdentity(
  identity: PrismaTelegramIdentityRecord,
): TelegramIdentityProfile {
  return {
    firstName: identity.firstName,
    id: identity.id,
    isPremium: identity.isPremium,
    languageCode: identity.languageCode,
    lastAuthenticatedAt: identity.lastAuthenticatedAt.toISOString(),
    lastAuthProvider: fromPrismaAuthProvider(identity.lastAuthProvider),
    lastName: identity.lastName,
    photoUrl: identity.photoUrl,
    telegramUserId: identity.telegramUserId,
    username: identity.username,
  };
}