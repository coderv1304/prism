import { Type } from "class-transformer";
import { IsIn, IsInt, IsString, Length, Max, Min, ValidateNested } from "class-validator";
import { JOB_TYPES, type JobType } from "@prism/contracts";

export class JobPayloadDto {
  @IsString()
  @Length(2, 80, { message: "label must be between 2 and 80 characters" })
  label!: string;

  @IsInt()
  @Min(100)
  @Max(50_000)
  records!: number;
}

export class CreateJobDto {
  @IsIn(JOB_TYPES, { message: `type must be one of: ${JOB_TYPES.join(", ")}` })
  type!: JobType;

  @ValidateNested()
  @Type(() => JobPayloadDto)
  payload!: JobPayloadDto;
}
