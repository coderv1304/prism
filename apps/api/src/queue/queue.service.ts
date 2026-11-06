import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import Redis from "ioredis";
import { QUEUE_NAME } from "@prism/contracts";

/**
 * Single producer-side queue wrapper. BullMQ owns retries and backoff; the
 * API only decides *what* to enqueue and keeps PostgreSQL as the source of
 * truth for job state.
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: Redis;
  private readonly queue: Queue;

  constructor(config: ConfigService) {
    this.connection = new Redis(config.getOrThrow<string>("REDIS_URL"), {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      // BullMQ's recommended producer settings: surface Redis outages quickly
      // instead of buffering commands forever.
      enableOfflineQueue: true,
    });

    this.connection.on("error", (error) => {
      this.logger.warn(`Redis connection error: ${error.message}`);
    });

    this.queue = new Queue(QUEUE_NAME, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2_000 },
        removeOnComplete: { age: 3_600, count: 500 },
        removeOnFail: { age: 86_400, count: 500 },
      },
    });
  }

  async enqueue(jobId: string): Promise<void> {
    // The BullMQ job id is the PostgreSQL uuid, which gives us idempotency:
    // re-submitting the same job can never create a duplicate queue entry.
    await this.queue.add("process", { jobId }, { jobId });
  }

  /**
   * Failed BullMQ jobs are retained so an operator can retry them. Retrying
   * means removing the old failed entry first, otherwise BullMQ would dedupe
   * on the reused job id and silently drop the new attempt.
   */
  async retry(jobId: string): Promise<void> {
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      await existing.remove();
    }
    await this.enqueue(jobId);
  }

  async getCounts(): Promise<{ waiting: number; active: number; completed: number; failed: number; delayed: number }> {
    const counts = await this.queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    };
  }

  async ping(): Promise<boolean> {
    try {
      const reply = await this.connection.ping();
      return reply === "PONG";
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
    if (this.connection.status !== "end") {
      await this.connection.quit();
    }
  }
}
