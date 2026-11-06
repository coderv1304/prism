import { getJobDefinition, type JobPayload, type JobType } from "@prism/contracts";
import { buildDigest, buildInsightReport, buildNormalizedDataset } from "../lib/workloads";

export type StageReporter = (progress: number, message: string) => Promise<void>;

const sleep = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function execute(type: JobType, payload: JobPayload): Record<string, unknown> {
  switch (type) {
    case "insight-report":
      return buildInsightReport(payload);
    case "dataset-normalize":
      return buildNormalizedDataset(payload);
    case "digest-render":
      return buildDigest(payload);
    default: {
      const exhaustive: never = type;
      throw new Error(`Unsupported job type: ${String(exhaustive)}`);
    }
  }
}

/**
 * Runs a job in four observable stages. The work itself is real (bounded,
 * deterministic data processing); the small pause between stages exists so
 * the console can demonstrate progress streaming without pretending that
 * production jobs are instant.
 */
export async function runJob(
  type: JobType,
  payload: JobPayload,
  reportStage: StageReporter,
  stageDelayMs = 450,
): Promise<Record<string, unknown>> {
  const definition = getJobDefinition(type);
  const [validate, load, compute, finalise] = definition.stages;

  await reportStage(10, `${validate} — ${payload.records.toLocaleString("en-US")} records`);
  if (stageDelayMs > 0) await sleep(stageDelayMs);

  await reportStage(40, `${load} — ${payload.label}`);
  if (stageDelayMs > 0) await sleep(stageDelayMs);

  const result = execute(type, payload);

  await reportStage(70, `${compute} — ${definition.label.toLowerCase()}`);
  if (stageDelayMs > 0) await sleep(stageDelayMs);

  await reportStage(92, `${finalise} — persisting result`);
  if (stageDelayMs > 0) await sleep(stageDelayMs);

  return { ...result, jobType: type, label: payload.label };
}
