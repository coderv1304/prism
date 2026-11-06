import pino from "pino";
import { loadEnv } from "./env";

const env = loadEnv();

export const logger = pino({
  level: env.logLevel,
  base: { service: "prism-worker", version: env.appVersion },
  redact: {
    paths: ["password", "databaseUrl", "redisUrl", "req.headers.authorization"],
    censor: "[redacted]",
  },
  ...(env.nodeEnv !== "production"
    ? { transport: { target: "pino-pretty", options: { singleLine: true, colorize: true } } }
    : {}),
});
