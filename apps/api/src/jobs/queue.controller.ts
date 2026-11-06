import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";

@ApiTags("queue")
@Controller("queue")
export class QueueController {
  constructor(private readonly jobsService: JobsService) {}

  @Get("stats")
  @ApiOperation({ summary: "Queue depth plus database-backed job metrics" })
  stats() {
    return this.jobsService.getQueueStats();
  }
}
