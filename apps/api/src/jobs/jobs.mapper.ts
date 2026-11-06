import {
  type Job as PrismaJob,
  type JobEvent as PrismaJobEvent,
  type JobStatus as PrismaJobStatus,
} from "@prisma/client";
import type { JobDto, JobEventDto, JobPayload, JobStatus, JobType } from "@prism/contracts";

type JobRecord = PrismaJob & { events?: PrismaJobEvent[] };

const STATUS_MAP: Record<PrismaJobStatus, JobStatus> = {
  QUEUED: "queued",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
};

export function toJobEventDto(event: PrismaJobEvent): JobEventDto {
  return {
    id: event.id,
    kind: event.kind as JobEventDto["kind"],
    message: event.message,
    createdAt: event.createdAt.toISOString(),
  };
}

/**
 * Prisma uses uppercase enum members; the HTTP contract uses lowercase.
 * Mapping in one place keeps that detail out of controllers and the UI.
 */
export function toJobDto(job: JobRecord): JobDto {
  return {
    id: job.id,
    type: job.type as JobType,
    status: STATUS_MAP[job.status],
    progress: job.progress,
    payload: job.payload as unknown as JobPayload,
    result: (job.result as Record<string, unknown> | null) ?? null,
    error: job.error,
    attempts: job.attempts,
    createdAt: job.createdAt.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    finishedAt: job.finishedAt?.toISOString() ?? null,
    durationMs: job.durationMs,
    ...(job.events ? { events: job.events.map(toJobEventDto) } : {}),
  };
}
