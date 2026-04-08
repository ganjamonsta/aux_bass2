import {
  Injectable,
  type ExecutionContext,
} from "@nestjs/common";
import type { CanActivate } from "@nestjs/common";

import { AuthService } from "./auth.service.js";
import type { AuthenticatedRequest } from "./authenticated-request.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    request.currentActor = await this.authService.requireAuthenticatedActor(request);

    return true;
  }
}