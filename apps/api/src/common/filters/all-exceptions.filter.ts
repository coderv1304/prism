import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Request, Response } from "express";
import type { ApiErrorBody } from "@prism/contracts";

/**
 * One error envelope for the whole API. The console can rely on `message`
 * being a string or an array (validation errors) and `path` for debugging.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;

    let message: string | string[] = "Internal server error";
    let error: string | undefined;

    if (typeof payload === "string") {
      message = payload;
    } else if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      if (typeof record.message === "string" || Array.isArray(record.message)) {
        message = record.message as string | string[];
      }
      if (typeof record.error === "string") {
        error = record.error;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiErrorBody = {
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}
