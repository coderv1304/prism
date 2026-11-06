import { Controller, Get, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type { HealthReport } from "@prism/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { QueueService } from "../queue/queue.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
    private readonly config: ConfigService,
  ) {}

  private async probe(): Promise<HealthReport> {
    const [database, redis] = await Promise.all([this.prisma.ping(), this.queue.ping()]);
    return {
      status: database && redis ? "ok" : "degraded",
      version: this.config.get<string>("APP_VERSION") ?? "1.0.0",
      uptimeSeconds: Math.round(process.uptime()),
      services: {
        database: database ? "up" : "down",
        redis: redis ? "up" : "down",
      },
      checkedAt: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: "Liveness probe — always 200 while the process is running" })
  liveness() {
    return this.probe();
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness probe — 503 when a dependency is unreachable" })
  async readiness(@Res({ passthrough: true }) response: Response) {
    const report = await this.probe();
    response.status(report.status === "ok" ? 200 : 503);
    return report;
  }
}
