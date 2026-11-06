import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { randomUUID } from "node:crypto";
import { validateEnvironment } from "./config/env.validation";
import { HealthModule } from "./health/health.module";
import { JobsModule } from "./jobs/jobs.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnvironment,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
        genReqId: (request, response) => {
          const incoming = request.headers["x-request-id"];
          const requestId = Array.isArray(incoming) ? incoming[0] : incoming;
          const id = requestId ?? randomUUID();
          response.setHeader("x-request-id", id);
          return id;
        },
        customProps: () => ({ service: "prism-api" }),
        redact: {
          paths: ["req.headers.authorization", "req.headers.cookie", "req.body.password"],
          censor: "[redacted]",
        },
        autoLogging: {
          ignore: (request) => request.url === "/api/v1/health",
        },
        ...(process.env.NODE_ENV !== "production"
          ? { transport: { target: "pino-pretty", options: { singleLine: true, colorize: true } } }
          : {}),
      },
    }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 120 }]),
    PrismaModule,
    QueueModule,
    JobsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
