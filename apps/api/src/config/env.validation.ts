const DEV_DATABASE_URL = "postgresql://prism:prism_dev_password@localhost:5432/prism";
const DEV_REDIS_URL = "redis://localhost:6379";

/**
 * Fail fast on bad configuration. A container that starts with a broken
 * DATABASE_URL is much harder to debug than one that refuses to boot.
 */
export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const nodeEnv = String(config.NODE_ENV ?? "development");
  const isProduction = nodeEnv === "production";
  const errors: string[] = [];

  const databaseUrl = String(config.DATABASE_URL ?? (isProduction ? "" : DEV_DATABASE_URL));
  const redisUrl = String(config.REDIS_URL ?? (isProduction ? "" : DEV_REDIS_URL));
  const apiPort = Number(config.API_PORT ?? 4000);

  if (!databaseUrl) errors.push("DATABASE_URL is required in production");
  if (!redisUrl) errors.push("REDIS_URL is required in production");
  if (!/^postgres(ql)?:\/\//.test(databaseUrl)) errors.push("DATABASE_URL must be a postgres:// connection string");
  if (!/^rediss?:\/\//.test(redisUrl)) errors.push("REDIS_URL must be a redis:// connection string");
  if (!Number.isInteger(apiPort) || apiPort <= 0 || apiPort > 65535) errors.push("API_PORT must be a valid TCP port");

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    DATABASE_URL: databaseUrl,
    REDIS_URL: redisUrl,
    API_PORT: apiPort,
    FRONTEND_ORIGIN: config.FRONTEND_ORIGIN ?? "http://localhost:3000",
    LOG_LEVEL: config.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    APP_VERSION: config.APP_VERSION ?? "1.0.0",
  };
}
