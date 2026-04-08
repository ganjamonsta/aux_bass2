import { Controller, Get } from "@nestjs/common";

import { createBootstrapManifest } from "@aux-player/domain";

@Controller("bootstrap")
export class BootstrapController {
  @Get()
  getBootstrapManifest() {
    return createBootstrapManifest();
  }
}