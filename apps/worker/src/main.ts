import { Worker } from "bullmq";
import Redis from "ioredis";
import { QUEUE_NAME } from "@prism/contracts";
import { loadEnv } from "./env";
import { startHealthServer } from "./health-server";
import { prisma } from "./lib/prisma";
import { logger } from "./logger";
import { markFailure, processBullJob, type PrismBullJob } from "./processors/job-runner";

const env = loadEnv();

async function main(): Promise<void> {
  const connection = new Redis(env.redisUrl, {
    // BullMQ requires blocking commands to wait indefinitely.
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  connection.on("error", (error) => {
    logger.warn({ err: error.message }, "Redis connection error");
  });

  let lastJobAt: string | null = null;

  const worker = new Worker<{ jobId: string }>(QUEUE_NAME, processBullJob, {
    connection,
    concurrency: env.concurrency,
    lockDuration: 30_000,
    stalledInterval: 30_000,
    maxStalledCount: 2,
  });

  worker.on("completed", (job) => {
    lastJobAt = new Date().toISOString();
    logger.info({ queueJobId: job.id }, "Queue job finished");
  });

  worker.on("failed", (job, error) => {
    lastJobAt = new Date().toISOString();
    void markFailure(job as PrismBullJob | undefined, error).catch((cause: unknown) => {
      logger.error({ err: cause instanceof Error ? cause.message : String(cause) }, "Could not persist failure state");
    });
  });

  worker.on("error", (error) => {
    logger.error({ err: error.message }, "Worker error");
  });

  worker.on("ready", () => {
    logger.info({ concurrency: env.concurrency, queue: QUEUE_NAME }, "Worker connected to Redis");
  });

  const server = startHealthServer({
    port: env.port,
    redis: connection,
    prisma,
    getLastJobAt: () => lastJobAt,
    version: env.appVersion,
  });

  logger.info(
    { env: env.nodeEnv, queue: QUEUE_NAME, concurrency: env.concurrency, healthPort: env.port },
    "Prism worker ready",
  );

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Graceful shutdown started");

    const forceExit = setTimeout(() => {
      logger.error("Shutdown timed out — forcing exit");
      process.exit(1);
    }, 20_000);
    forceExit.unref();

    try {
      // Waits for in-flight jobs before closing the Redis connection.
      await worker.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await prisma.$disconnect();
      if (connection.status !== "end") await connection.quit();
      logger.info("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      logger.error({ err: error instanceof Error ? error.message : String(error) }, "Shutdown failed");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((error: unknown) => {
  logger.error({ err: error instanceof Error ? error.stack : String(error) }, "Worker failed to start");
  process.exit(1);
});
