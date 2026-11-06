import { Prisma, type Job as PrismaJob } from "@prisma/client";
import type { Job as BullJob } from "bullmq";
import { getJobDefinition, type JobPayload, type JobType } from "@prism/contracts";
import { prisma } from "../lib/prisma";
import { logger } from "../logger";
import { runJob } from "../processors/run-job";

interface QueuePayload {
  jobId: string;
}

export type PrismBullJob = BullJob<QueuePayload>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Persist a successful run and close the timeline. */
export async function processBullJob(job: PrismBullJob): Promise<void> {
  const jobId = job.data?.jobId;
  if (!jobId) {
    throw new Error("Queue payload is missing jobId");
  }

  const record: PrismaJob | null = await prisma.job.findUnique({ where: { id: jobId } });
  if (!record) {
    // Without a database row there is nowhere to persist progress. Failing
    // loudly (instead of silently completing) keeps the queue honest.
    throw new Error(`Job ${jobId} is not present in PostgreSQL`);
  }

  const payload = record.payload as unknown as JobPayload;
  const definition = getJobDefinition(record.type as JobType);
  const startedAt = new Date();

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "ACTIVE",
      progress: 5,
      startedAt: record.startedAt ?? startedAt,
      attempts: { increment: 1 },
      events: {
        create: {
          kind: "lifecycle",
          message: `Worker picked up ${definition.label.toLowerCase()} (attempt ${job.attemptsMade + 1})`,
        },
      },
    },
  });

  const result = await runJob(record.type as JobType, payload, async (progress, message) => {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        progress,
        events: { create: { kind: "progress", message } },
      },
    });
    await job.updateProgress(progress);
  });

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      result: result as Prisma.InputJsonValue,
      error: null,
      finishedAt: new Date(),
      durationMs: Date.now() - (job.processedOn ?? startedAt.getTime()),
      events: {
        create: {
          kind: "lifecycle",
          message: `Completed in ${Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 1000))}s`,
        },
      },
    },
  });

  await job.updateProgress(100);
  logger.info({ jobId, type: record.type, attempt: job.attemptsMade + 1 }, "Job completed");
}

/**
 * Called from the BullMQ `failed` event. The job is only terminal once every
 * configured attempt has been used; until then it goes back to `queued` so the
 * console can show the upcoming retry.
 */
export async function markFailure(job: PrismBullJob | undefined, error: unknown): Promise<void> {
  if (!job?.data?.jobId) return;

  const jobId = job.data.jobId;
  const maxAttempts = job.opts.attempts ?? 1;
  const willRetry = job.attemptsMade < maxAttempts;
  const message = errorMessage(error);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: willRetry ? "QUEUED" : "FAILED",
      error: message,
      ...(willRetry
        ? {}
        : {
            finishedAt: new Date(),
            durationMs: Date.now() - (job.processedOn ?? Date.now()),
          }),
      events: {
        create: {
          kind: willRetry ? "warning" : "error",
          message: willRetry
            ? `Attempt ${job.attemptsMade}/${maxAttempts} failed — retrying with backoff: ${message}`
            : `Job failed after ${maxAttempts} attempt(s): ${message}`,
        },
      },
    },
  });

  logger.warn({ jobId, attempt: job.attemptsMade, maxAttempts, willRetry, err: message }, "Job attempt failed");
}
