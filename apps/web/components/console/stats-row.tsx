import type { QueueStats } from "@prism/contracts";
import { formatDuration, formatNumber, percent } from "@/lib/format";
import { cn } from "@/lib/cn";

function StatCell({
  label,
  value,
  hint,
  tone,
  loading,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: string;
  loading: boolean;
}) {
  return (
    <div className="bg-ink px-5 py-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-16 bg-paper/10" />
      ) : (
        <p className={cn("mt-1 font-display text-[32px] leading-none tabular", tone ?? "text-paper")}>{value}</p>
      )}
      <p className="mt-2 text-[10.5px] text-paper/40">{hint}</p>
    </div>
  );
}

export function StatsRow({ stats, loading }: { stats: QueueStats | null; loading: boolean }) {
  const counts = stats?.counts;
  const summary = stats?.summary;
  const failing = (summary?.failureRate ?? 0) > 0;

  return (
    <div className="grid grid-cols-2 gap-px border border-paper/15 bg-paper/10 lg:grid-cols-4">
      <StatCell
        label="Queued"
        value={formatNumber(counts?.queued ?? 0)}
        hint="waiting in Redis"
        loading={loading}
      />
      <StatCell
        label="Active"
        value={formatNumber(counts?.active ?? 0)}
        hint="processing right now"
        tone="text-ember"
        loading={loading}
      />
      <StatCell
        label="Completed · 1h"
        value={formatNumber(summary?.completedLastHour ?? 0)}
        hint={`avg ${formatDuration(summary?.avgDurationMs ?? null)}`}
        tone="text-sage"
        loading={loading}
      />
      <StatCell
        label="Failure rate"
        value={percent(summary?.failureRate ?? 0)}
        hint={`${formatNumber(counts?.failed ?? 0)} failed in the queue`}
        tone={failing ? "text-ember" : "text-sage"}
        loading={loading}
      />
    </div>
  );
}
