import type { AuthenticatedActor } from "@aux-player/domain";
import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  currentActor?: AuthenticatedActor;
}