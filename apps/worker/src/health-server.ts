import { createServer, type Server } from "node:http";
import type { PrismaClient } from "@prisma/client";
import type Redis from "ioredis";

interface HealthServerOptions {
  port: number;
  redis: Redis;
  prisma: PrismaClient;
  getLastJobAt: () => string | null;
  version: string;
}

/**
 * The worker has no public HTTP surface, but it still needs a probe for
 * Docker / Container Apps. Only the health routes are exposed, on the
 * private container network.
 */
export function startHealthServer(options: HealthServerOptions): Server {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://worker.local");
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");

    if (url.pathname === "/health") {
      response.statusCode = 200;
      response.end(
        JSON.stringify({
          status: "ok",
          role: "worker",
          version: options.version,
          uptimeSeconds: Math.round(process.uptime()),
          lastJobAt: options.getLastJobAt(),
        }),
      );
      return;
    }

    if (url.pathname === "/health/ready") {
      let database = false;
      let redis = false;
      try {
        await options.prisma.$queryRaw`SELECT 1`;
        database = true;
      } catch {
        database = false;
      }
      try {
        redis = (await options.redis.ping()) === "PONG";
      } catch {
        redis = false;
      }

      const ready = database && redis;
      response.statusCode = ready ? 200 : 503;
      response.end(
        JSON.stringify({
          status: ready ? "ok" : "degraded",
          role: "worker",
          services: { database: database ? "up" : "down", redis: redis ? "up" : "down" },
          checkedAt: new Date().toISOString(),
        }),
      );
      return;
    }

    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Not found" }));
  });

  server.listen(options.port, "0.0.0.0");
  return server;
}
