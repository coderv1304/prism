import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CreateJobDto } from "./dto/create-job.dto";
import { ListJobsQueryDto } from "./dto/list-jobs.dto";
import { JobsService } from "./jobs.service";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  @ApiOperation({ summary: "Create a job and enqueue it in Redis" })
  @ApiResponse({ status: 201, description: "Job accepted" })
  @ApiResponse({ status: 429, description: "Too many submissions" })
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List jobs, newest first" })
  list(@Query() query: ListJobsQueryDto) {
    return this.jobsService.list(query);
  }

  @Get(":id")
  @ApiParam({ name: "id", description: "Job UUID" })
  @ApiOperation({ summary: "Fetch a job with its event timeline" })
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.jobsService.findOne(id);
  }

  @Post(":id/retry")
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  @ApiOperation({ summary: "Re-enqueue a failed job" })
  retry(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.jobsService.retry(id);
  }
}
