/**
 * Seeds a handful of historical jobs so the console has something to show on
 * a fresh install. Idempotent: it exits early when jobs already exist.
 *
 * Run with: npm run db:seed -w @prism/api
 */
import { JobStatus, PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000);

type SeedJob = {
  type: string;
  status: JobStatus;
  label: string;
  records: number;
  progress: number;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  durationMs: number | null;
  result: Prisma.InputJsonValue | null;
  error: string | null;
  attempts: number;
  events: Array<{ kind: string; message: string; minutesAgo: number }>;
};

const jobs: SeedJob[] = [
  {
    type: "insight-report",
    status: "COMPLETED",
    label: "Q3 revenue pulse",
    records: 2_500,
    progress: 100,
    createdAt: minutesAgo(38),
    startedAt: minutesAgo(38),
    finishedAt: minutesAgo(37),
    durationMs: 41_200,
    result: { rows: 2_500, segments: 6, topSegment: "Self-serve", checksum: "a91f3c" },
    error: null,
    attempts: 1,
    events: [
      { kind: "lifecycle", message: "Job accepted and queued", minutesAgo: 38 },
      { kind: "progress", message: "Aggregating metrics — 2,500 rows", minutesAgo: 38 },
      { kind: "progress", message: "Report formatted and persisted", minutesAgo: 37 },
    ],
  },
  {
    type: "dataset-normalize",
    status: "COMPLETED",
    label: "Workspace event import",
    records: 5_000,
    progress: 100,
    createdAt: minutesAgo(121),
    startedAt: minutesAgo(121),
    finishedAt: minutesAgo(119),
    durationMs: 96_400,
    result: { scanned: 5_000, duplicates: 184, normalized: 4_816, checksum: "7d02be" },
    error: null,
    attempts: 1,
    events: [{ kind: "lifecycle", message: "Job accepted and queued", minutesAgo: 121 }],
  },
  {
    type: "digest-render",
    status: "COMPLETED",
    label: "Weekly product digest",
    records: 1_200,
    progress: 100,
    createdAt: minutesAgo(305),
    startedAt: minutesAgo(305),
    finishedAt: minutesAgo(304),
    durationMs: 28_700,
    result: { sections: 4, words: 1_208, checksum: "c4e118" },
    error: null,
    attempts: 1,
    events: [{ kind: "lifecycle", message: "Job accepted and queued", minutesAgo: 305 }],
  },
  {
    type: "dataset-normalize",
    status: "FAILED",
    label: "Legacy CRM import",
    records: 12_000,
    progress: 62,
    createdAt: minutesAgo(240),
    startedAt: minutesAgo(239),
    finishedAt: minutesAgo(238),
    durationMs: 61_300,
    result: null,
    error: "Source checksum mismatch — expected 8f21aa, received 000000",
    attempts: 3,
    events: [
      { kind: "lifecycle", message: "Job accepted and queued", minutesAgo: 240 },
      { kind: "warning", message: "Attempt 1 failed — retrying with exponential backoff", minutesAgo: 239 },
      { kind: "error", message: "Source checksum mismatch after 3 attempts", minutesAgo: 238 },
    ],
  },
];

async function main(): Promise<void> {
  const existing = await prisma.job.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} job(s) already present.`);
    return;
  }

  for (const seed of jobs) {
    await prisma.job.create({
      data: {
        type: seed.type,
        status: seed.status,
        progress: seed.progress,
        payload: { label: seed.label, records: seed.records },
        result: seed.result ?? Prisma.JsonNull,
        error: seed.error,
        attempts: seed.attempts,
        createdAt: seed.createdAt,
        startedAt: seed.startedAt,
        finishedAt: seed.finishedAt,
        durationMs: seed.durationMs,
        events: {
          create: seed.events.map((event) => ({
            kind: event.kind,
            message: event.message,
            createdAt: minutesAgo(event.minutesAgo),
          })),
        },
      },
    });
  }

  console.log(`Seeded ${jobs.length} historical jobs.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
