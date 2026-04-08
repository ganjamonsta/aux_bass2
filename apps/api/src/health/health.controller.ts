import { Controller, Get } from "@nestjs/common";

import { APP_NAME } from "@aux-player/domain";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: `${APP_NAME} API`,
      timestamp: new Date().toISOString(),
    };
  }
}
