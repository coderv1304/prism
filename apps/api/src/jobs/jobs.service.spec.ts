import { ConflictException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import type { Job } from "@prisma/client";
import { JobsService } from "./jobs.service";
import type { PrismaService } from "../prisma/prisma.service";
import type { QueueService } from "../queue/queue.service";

const NOW = new Date("2026-11-05T10:00:00.000Z");

function buildJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "insight-report",
    status: "QUEUED",
    progress: 0,
    payload: { label: "Revenue pulse", records: 2500 },
    result: null,
    error: null,
    attempts: 0,
    createdAt: NOW,
    startedAt: null,
    finishedAt: null,
    durationMs: null,
    ...overrides,
  };
}

function buildService() {
  const prisma = {
    job: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const queue = {
    enqueue: jest.fn().mockResolvedValue(undefined),
    retry: jest.fn().mockResolvedValue(undefined),
    getCounts: jest.fn(),
  };

  const service = new JobsService(prisma as unknown as PrismaService, queue as unknown as QueueService);
  return { service, prisma, queue };
}

describe("JobsService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a job and enqueues it with the database id", async () => {
    const { service, prisma, queue } = buildService();
    const job = buildJob();
    prisma.job.create.mockResolvedValue(job);

    const result = await service.create({
      type: "insight-report",
      payload: { label: "Revenue pulse", records: 2500 },
    });

    expect(prisma.job.create).toHaveBeenCalledTimes(1);
    expect(queue.enqueue).toHaveBeenCalledWith(job.id);
    expect(result.status).toBe("queued");
    expect(result.payload).toEqual({ label: "Revenue pulse", records: 2500 });
  });

  it("marks the job failed and returns 503 when Redis is unavailable", async () => {
    const { service, prisma, queue } = buildService();
    const job = buildJob();
    prisma.job.create.mockResolvedValue(job);
    prisma.job.update.mockResolvedValue(job);
    queue.enqueue.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      service.create({ type: "insight-report", payload: { label: "Revenue pulse", records: 2500 } }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(prisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: job.id },
        data: expect.objectContaining({ status: "FAILED" }),
      }),
    );
  });

  it("throws 404 for an unknown job", async () => {
    const { service, prisma } = buildService();
    prisma.job.findUnique.mockResolvedValue(null);

    await expect(service.findOne("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses to retry a job that has not failed", async () => {
    const { service, prisma } = buildService();
    prisma.job.findUnique.mockResolvedValue(buildJob({ status: "COMPLETED" }));

    await expect(service.retry("job-id")).rejects.toBeInstanceOf(ConflictException);
  });

  it("resets a failed job and re-enqueues it", async () => {
    const { service, prisma, queue } = buildService();
    const failed = buildJob({ status: "FAILED", error: "boom", attempts: 3 });
    prisma.job.findUnique.mockResolvedValue(failed);
    prisma.job.update.mockResolvedValue(buildJob({ status: "QUEUED" }));

    const result = await service.retry(failed.id);

    expect(prisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "QUEUED", attempts: 0, error: null }),
      }),
    );
    expect(queue.retry).toHaveBeenCalledWith(failed.id);
    expect(result.status).toBe("queued");
  });

  it("combines Redis queue depth with database aggregates", async () => {
    const { service, prisma, queue } = buildService();
    queue.getCounts.mockResolvedValue({ waiting: 2, active: 1, completed: 9, failed: 1, delayed: 3 });
    prisma.job.groupBy.mockResolvedValue([
      { status: "COMPLETED", _count: { _all: 9 } },
      { status: "FAILED", _count: { _all: 1 } },
    ]);
    prisma.job.aggregate.mockResolvedValue({ _avg: { durationMs: 1200 } });
    prisma.job.count.mockResolvedValueOnce(4).mockResolvedValueOnce(10);

    const stats = await service.getQueueStats();

    expect(stats.counts).toEqual({ queued: 5, active: 1, completed: 9, failed: 1, delayed: 3 });
    expect(stats.summary.total).toBe(10);
    expect(stats.summary.failureRate).toBe(0.1);
    expect(stats.summary.avgDurationMs).toBe(1200);
  });
});
