import type {
  ApiErrorBody,
  HealthReport,
  JobDto,
  JobListResponse,
  JobPayload,
  JobStatus,
  JobType,
  QueueStats,
} from "@prism/contracts";

/**
 * All browser traffic is same-origin. The Next.js route handler under
 * /api/v1 forwards to the private API host, which keeps the API off the
 * public internet and removes CORS from the deployment equation.
 */
const BASE = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (Array.isArray(body.message)) message = body.message.join(" · ");
      else if (typeof body.message === "string") message = body.message;
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export interface CreateJobInput {
  type: JobType;
  payload: JobPayload;
}

export const api = {
  listJobs(status?: JobStatus, limit = 20): Promise<JobListResponse> {
    const query = new URLSearchParams({ limit: String(limit) });
    if (status) query.set("status", status);
    return request<JobListResponse>(`/jobs?${query.toString()}`);
  },

  getJob(id: string): Promise<JobDto> {
    return request<JobDto>(`/jobs/${id}`);
  },

  createJob(input: CreateJobInput): Promise<JobDto> {
    return request<JobDto>("/jobs", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  retryJob(id: string): Promise<JobDto> {
    return request<JobDto>(`/jobs/${id}/retry`, { method: "POST" });
  },

  getStats(): Promise<QueueStats> {
    return request<QueueStats>("/queue/stats");
  },

  async getHealth(): Promise<HealthReport> {
    const response = await fetch("/api/health", { cache: "no-store" });
    const body = (await response.json()) as HealthReport;
    if (!response.ok && !body?.status) {
      throw new ApiError("Health probe failed", response.status);
    }
    return body;
  },
};
