/**
 * Contracts shared by every Prism runtime.
 *
 * Keeping the wire format in one package means the NestJS API, the BullMQ
 * worker and the Next.js console can never drift apart silently.
 */

export const API_PREFIX = "/api/v1" as const;
export const QUEUE_NAME = "prism-jobs" as const;

export const JOB_STATUSES = ["queued", "active", "completed", "failed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_TYPES = ["insight-report", "dataset-normalize", "digest-render"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export interface JobPayload {
  /** Human-readable title shown on the console. */
  label: string;
  /** Simulated dataset size — drives the work units, not the wall clock. */
  records: number;
}

export interface JobDefinition {
  type: JobType;
  label: string;
  blurb: string;
  emoji: string;
  defaultRecords: number;
  accent: "violet" | "cyan" | "amber";
  stages: readonly string[];
}

export const JOB_CATALOG: readonly JobDefinition[] = [
  {
    type: "insight-report",
    label: "Insight report",
    blurb: "Aggregates a synthetic event stream into a shareable summary.",
    emoji: "📊",
    defaultRecords: 2_500,
    accent: "violet",
    stages: ["Validating payload", "Loading records", "Aggregating metrics", "Formatting report"],
  },
  {
    type: "dataset-normalize",
    label: "Dataset normalize",
    blurb: "Trims, de-duplicates and checksums a batch of records.",
    emoji: "🧹",
    defaultRecords: 5_000,
    accent: "cyan",
    stages: ["Validating payload", "Scanning records", "De-duplicating", "Writing checksum"],
  },
  {
    type: "digest-render",
    label: "Digest render",
    blurb: "Renders a weekly digest with a deterministic content hash.",
    emoji: "📮",
    defaultRecords: 1_200,
    accent: "amber",
    stages: ["Validating payload", "Collecting sections", "Composing digest", "Signing output"],
  },
] as const;

export interface JobEventDto {
  id: string;
  kind: "lifecycle" | "progress" | "warning" | "error";
  message: string;
  createdAt: string;
}

export interface JobDto {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  payload: JobPayload;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  events?: JobEventDto[];
}

export interface JobListResponse {
  data: JobDto[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface QueueStats {
  counts: {
    queued: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  summary: {
    total: number;
    completedLastHour: number;
    failureRate: number;
    avgDurationMs: number;
  };
  sampledAt: string;
}

export interface HealthReport {
  status: "ok" | "degraded";
  version: string;
  uptimeSeconds: number;
  services: {
    database: "up" | "down";
    redis: "up" | "down";
  };
  checkedAt: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}

/** Job type guard shared by the API validation layer. */
export function isJobType(value: unknown): value is JobType {
  return typeof value === "string" && (JOB_TYPES as readonly string[]).includes(value);
}

export function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && (JOB_STATUSES as readonly string[]).includes(value);
}

export function getJobDefinition(type: JobType): JobDefinition {
  const definition = JOB_CATALOG.find((entry) => entry.type === type);
  if (!definition) {
    throw new Error(`Unknown job type: ${String(type)}`);
  }
  return definition;
}
