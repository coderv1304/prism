import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";
import { API_PREFIX } from "@prism/contracts";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(PinoLogger);
  app.useLogger(logger);

  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>("API_PORT");
  const environment = config.getOrThrow<string>("NODE_ENV");

  app.use(helmet());
  app.use(compression());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  // Required for accurate client IPs (and therefore rate limiting) behind a
  // load balancer / ingress such as Azure Container Apps.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  const allowedOrigins = config
    .getOrThrow<string>("FRONTEND_ORIGIN")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 86_400,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Prism API")
    .setDescription("Job intake, queue orchestration and health reporting for the Prism async platform.")
    .setVersion(config.get<string>("APP_VERSION") ?? "1.0.0")
    .addServer(`http://localhost:${port}`, "Local")
    .addTag("jobs", "Create, list and retry background jobs")
    .addTag("queue", "Queue depth and aggregate metrics")
    .addTag("health", "Liveness and readiness probes")
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { displayRequestDuration: true },
  });

  await app.listen(port, "0.0.0.0");

  logger.log(
    { port, environment, api: `http://localhost:${port}${API_PREFIX}`, docs: `http://localhost:${port}/api/docs` },
    "Prism API ready",
  );
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger("Bootstrap");
  logger.error("Fatal error during startup", error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
