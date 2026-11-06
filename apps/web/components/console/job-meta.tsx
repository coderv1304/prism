import { BarChart3, CheckCircle2, Clock, Database, Loader2, Mail, XCircle, type LucideIcon } from "lucide-react";
import { JOB_CATALOG, type JobStatus, type JobType } from "@prism/contracts";

export const typeIcons: Record<JobType, LucideIcon> = {
  "insight-report": BarChart3,
  "dataset-normalize": Database,
  "digest-render": Mail,
};

export const statusMeta: Record<JobStatus, { label: string; badge: string; icon: LucideIcon; dot: string }> = {
  queued: {
    label: "Queued",
    badge: "border-amber/25 bg-amber/10 text-amber",
    icon: Clock,
    dot: "bg-amber",
  },
  active: {
    label: "Active",
    badge: "border-fuchsia/25 bg-fuchsia/10 text-fuchsia",
    icon: Loader2,
    dot: "bg-fuchsia",
  },
  completed: {
    label: "Completed",
    badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    icon: CheckCircle2,
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Failed",
    badge: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    icon: XCircle,
    dot: "bg-rose-400",
  },
};

export function jobEmoji(type: JobType): string {
  return JOB_CATALOG.find((entry) => entry.type === type)?.emoji ?? "✦";
}

export function jobLabel(type: JobType): string {
  return JOB_CATALOG.find((entry) => entry.type === type)?.label ?? type;
}
