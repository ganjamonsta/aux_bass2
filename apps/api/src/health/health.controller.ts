import { Controller, Get } from "@nestjs/common";

import { createRuntimeHealthSnapshot } from "@aux-player/domain";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return createRuntimeHealthSnapshot("api");
  }
}
