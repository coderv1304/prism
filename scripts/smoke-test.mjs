#!/usr/bin/env node
/**
 * End-to-end smoke test.
 *
 * Creates a real job through the public web origin (and therefore through the
 * Next.js BFF), then polls until Postgres reports a terminal state. This is the
 * same path a reviewer takes in the console, with no test-only shortcuts.
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   BASE_URL=https://prism.example.com node scripts/smoke-test.mjs
 */

const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 45_000);
const pollMs = 1_000;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from ${response.url}, received: ${text.slice(0, 200)}`);
  }
}

async function main() {
  console.log(`Prism smoke test → ${baseUrl}`);

  const healthResponse = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  const health = await json(healthResponse);
  if (!healthResponse.ok || health.status !== "ok") {
    fail(`Health check failed (${healthResponse.status}): ${JSON.stringify(health)}`);
  }
  console.log(`✓ health ok — database: ${health.services.database}, redis: ${health.services.redis}`);

  const createResponse = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "insight-report",
      payload: { label: "Automated smoke test", records: 2_500 },
    }),
  });
  const job = await json(createResponse);
  if (createResponse.status !== 201) {
    fail(`Job creation failed (${createResponse.status}): ${JSON.stringify(job)}`);
  }
  console.log(`✓ job queued — ${job.id}`);

  const deadline = Date.now() + timeoutMs;
  let current = job;
  while (Date.now() < deadline) {
    const response = await fetch(`${baseUrl}/api/v1/jobs/${job.id}`, { cache: "no-store" });
    current = await json(response);
    if (!response.ok) fail(`Job lookup failed (${response.status}): ${JSON.stringify(current)}`);

    process.stdout.write(`  ${current.status.padEnd(9)} ${String(current.progress).padStart(3)}%\r`);
    if (current.status === "completed" || current.status === "failed") break;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  process.stdout.write(" ".repeat(40) + "\r");
  if (current.status !== "completed") {
    fail(`Job ended in "${current.status}" after ${timeoutMs / 1000}s: ${current.error ?? "no error"}`);
  }
  if (!current.result) {
    fail("Job completed without a persisted result");
  }

  console.log(`✓ job completed in ${current.durationMs}ms with ${current.events?.length ?? 0} events`);
  console.log(`  checksum: ${current.result.checksum ?? "n/a"}`);
  console.log("✓ smoke test passed");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
