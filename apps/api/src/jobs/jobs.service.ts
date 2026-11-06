import { ConflictException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { Prisma, type JobStatus as PrismaJobStatus } from "@prisma/client";
import type { JobListResponse, JobStatus, QueueStats } from "@prism/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { QueueService } from "../queue/queue.service";
import type { CreateJobDto } from "./dto/create-job.dto";
import type { ListJobsQueryDto } from "./dto/list-jobs.dto";
import { toJobDto } from "./jobs.mapper";

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  async create(dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        type: dto.type,
        payload: dto.payload as unknown as Prisma.InputJsonValue,
        events: {
          create: { kind: "lifecycle", message: "Job accepted and queued" },
        },
      },
    });

    try {
      await this.queue.enqueue(job.id);
      this.logger.log({ jobId: job.id, type: job.type }, "Job enqueued");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown queue error";
      this.logger.error({ jobId: job.id, err: message }, "Failed to enqueue job");

      // Do not leave a QUEUED row that no worker will ever see. The API fails
      // loudly and the console shows a failed job with a retry affordance.
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: `Queue unavailable: ${message}`,
          finishedAt: new Date(),
          events: { create: { kind: "error", message: "Could not reach Redis — job was not enqueued" } },
        },
      });

      throw new ServiceUnavailableException("Job queue is unavailable. Please retry in a moment.");
    }

    return toJobDto(job);
  }

  async list(query: ListJobsQueryDto): Promise<JobListResponse> {
    const where: Prisma.JobWhereInput = query.status ? { status: query.status.toUpperCase() as PrismaJobStatus } : {};

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: rows.map(toJobDto),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: "asc" } } },
    });

    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    return toJobDto(job);
  }

  async retry(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    if (job.status !== "FAILED") {
      throw new ConflictException("Only failed jobs can be retried");
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: "QUEUED",
        progress: 0,
        error: null,
        attempts: 0,
        result: Prisma.JsonNull,
        startedAt: null,
        finishedAt: null,
        durationMs: null,
        events: { create: { kind: "lifecycle", message: "Retry requested by operator" } },
      },
    });

    try {
      await this.queue.retry(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown queue error";
      await this.prisma.job.update({
        where: { id },
        data: {
          status: "FAILED",
          error: `Queue unavailable: ${message}`,
          finishedAt: new Date(),
          events: { create: { kind: "error", message: "Retry failed — Redis was unreachable" } },
        },
      });
      throw new ServiceUnavailableException("Job queue is unavailable. Please retry in a moment.");
    }

    this.logger.log({ jobId: id }, "Job re-enqueued");
    return toJobDto(updated);
  }

  async getQueueStats(): Promise<QueueStats> {
    const [counts, databaseCounts, aggregate, completedLastHour, total] = await Promise.all([
      this.queue.getCounts(),
      this.prisma.job.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.job.aggregate({
        _avg: { durationMs: true },
        where: { status: "COMPLETED" },
      }),
      this.prisma.job.count({
        where: { status: "COMPLETED", finishedAt: { gte: new Date(Date.now() - 3_600_000) } },
      }),
      this.prisma.job.count(),
    ]);

    const byStatus = databaseCounts.reduce<Partial<Record<PrismaJobStatus, number>>>((accumulator, row) => {
      accumulator[row.status] = row._count._all;
      return accumulator;
    }, {});

    const failed = byStatus.FAILED ?? 0;
    const statusCounts: Record<JobStatus, number> = {
      queued: byStatus.QUEUED ?? 0,
      active: byStatus.ACTIVE ?? 0,
      completed: byStatus.COMPLETED ?? 0,
      failed,
    };

    return {
      counts: {
        queued: counts.waiting + counts.delayed,
        active: counts.active > 0 ? counts.active : statusCounts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
      },
      summary: {
        total,
        completedLastHour,
        failureRate: total === 0 ? 0 : Number((failed / total).toFixed(4)),
        avgDurationMs: Math.round(aggregate._avg.durationMs ?? 0),
      },
      sampledAt: new Date().toISOString(),
    };
  }
}
