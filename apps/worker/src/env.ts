const DEV_DATABASE_URL = "postgresql://prism:prism_dev_password@localhost:5432/prism";
const DEV_REDIS_URL = "redis://localhost:6379";

export interface WorkerEnv {
  nodeEnv: string;
  databaseUrl: string;
  redisUrl: string;
  port: number;
  concurrency: number;
  stageDelayMs: number;
  logLevel: string;
  appVersion: string;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): WorkerEnv {
  const nodeEnv = source.NODE_ENV ?? "development";
  const isProduction = nodeEnv === "production";
  const databaseUrl = source.DATABASE_URL ?? (isProduction ? "" : DEV_DATABASE_URL);
  const redisUrl = source.REDIS_URL ?? (isProduction ? "" : DEV_REDIS_URL);

  const port = Number(source.WORKER_PORT ?? 4001);
  const concurrency = Number(source.WORKER_CONCURRENCY ?? 4);
  const stageDelayMs = Number(source.JOB_STAGE_DELAY_MS ?? 450);

  const errors: string[] = [];
  if (!databaseUrl) errors.push("DATABASE_URL is required in production");
  if (!redisUrl) errors.push("REDIS_URL is required in production");
  if (!/^postgres(ql)?:\/\//.test(databaseUrl)) errors.push("DATABASE_URL must be a postgres:// connection string");
  if (!/^rediss?:\/\//.test(redisUrl)) errors.push("REDIS_URL must be a redis:// connection string");
  if (!Number.isInteger(port) || port <= 0 || port > 65535) errors.push("WORKER_PORT must be a valid TCP port");
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50) {
    errors.push("WORKER_CONCURRENCY must be between 1 and 50");
  }
  if (!Number.isInteger(stageDelayMs) || stageDelayMs < 0 || stageDelayMs > 10_000) {
    errors.push("JOB_STAGE_DELAY_MS must be between 0 and 10000");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid worker environment:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  }

  return {
    nodeEnv,
    databaseUrl,
    redisUrl,
    port,
    concurrency,
    stageDelayMs,
    logLevel: source.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    appVersion: source.APP_VERSION ?? "1.0.0",
  };
}
