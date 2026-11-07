import { JOB_CATALOG, type JobStatus, type JobType } from "@prism/contracts";

export const statusMeta: Record<JobStatus, { label: string; badge: string; dot: string }> = {
  queued: {
    label: "Queued",
    badge: "border-brass/30 bg-brass/10 text-brass",
    dot: "bg-brass",
  },
  active: {
    label: "Active",
    badge: "border-ember/35 bg-ember/10 text-ember",
    dot: "bg-ember",
  },
  completed: {
    label: "Completed",
    badge: "border-sage/30 bg-sage/10 text-sage",
    dot: "bg-sage",
  },
  failed: {
    label: "Failed",
    badge: "border-ember/40 bg-ember/10 text-ember",
    dot: "bg-ember",
  },
};

export function jobLabel(type: JobType): string {
  return JOB_CATALOG.find((entry) => entry.type === type)?.label ?? type;
}

export function jobCode(type: JobType): string {
  return type
    .split("-")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
