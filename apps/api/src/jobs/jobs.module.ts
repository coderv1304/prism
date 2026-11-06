import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { QueueController } from "./queue.controller";

@Module({
  imports: [PrismaModule],
  controllers: [JobsController, QueueController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
