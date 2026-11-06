import type { HealthReport } from "@prism/contracts";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export const dynamic = "force-dynamic";

/**
 * Edge-of-the-app health check used by Docker Compose / Container Apps. It
 * proves the web server can reach the API, not just that Next.js is up.
 */
export async function GET(): Promise<Response> {
  try {
    const upstream = await fetch(`${API_INTERNAL_URL}/api/v1/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    const body = (await upstream.json()) as HealthReport;
    return Response.json(body, {
      status: upstream.ok ? 200 : 503,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    const fallback: HealthReport = {
      status: "degraded",
      version: "web",
      uptimeSeconds: Math.round(process.uptime()),
      services: { database: "down", redis: "down" },
      checkedAt: new Date().toISOString(),
    };
    return Response.json(fallback, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
