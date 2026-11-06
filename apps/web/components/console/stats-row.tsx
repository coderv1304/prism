import { Activity, CheckCircle2, Clock, Gauge } from "lucide-react";
import type { QueueStats } from "@prism/contracts";
import { GlassCard } from "@/components/ui/glass-card";
import { formatDuration, formatNumber, percent } from "@/lib/format";
import { cn } from "@/lib/cn";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  loading,
  pulse,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Clock;
  tone: "amber" | "fuchsia" | "emerald" | "rose";
  loading: boolean;
  pulse?: boolean;
}) {
  const tones = {
    amber: "border-amber/20 bg-amber/10 text-amber",
    fuchsia: "border-fuchsia/20 bg-fuchsia/10 text-fuchsia",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  } as const;

  return (
    <GlassCard className="h-full p-5 pt-6" interactive={false}>
      <div aria-hidden="true" className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", tones[tone])}>
          <Icon className={cn("h-4 w-4", pulse && "animate-spin")} />
        </div>
        <span className={cn("h-1.5 w-1.5 rounded-full", pulse ? "animate-pulse bg-fuchsia" : "bg-white/15")} />
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-mist/50">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-white/[0.06]" />
      ) : (
        <p className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-white tabular">{value}</p>
      )}
      <p className="mt-2 text-[10.5px] text-mist/55">{hint}</p>
    </GlassCard>
  );
}

export function StatsRow({ stats, loading }: { stats: QueueStats | null; loading: boolean }) {
  const counts = stats?.counts;
  const summary = stats?.summary;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Queued"
        value={formatNumber(counts?.queued ?? 0)}
        hint="waiting in Redis"
        icon={Clock}
        tone="amber"
        loading={loading}
      />
      <StatCard
        label="Active"
        value={formatNumber(counts?.active ?? 0)}
        hint="processing right now"
        icon={Activity}
        tone="fuchsia"
        loading={loading}
        pulse={(counts?.active ?? 0) > 0}
      />
      <StatCard
        label="Completed · 1h"
        value={formatNumber(summary?.completedLastHour ?? 0)}
        hint={`avg ${formatDuration(summary?.avgDurationMs ?? null)}`}
        icon={CheckCircle2}
        tone="emerald"
        loading={loading}
      />
      <StatCard
        label="Failure rate"
        value={percent(summary?.failureRate ?? 0)}
        hint={`${formatNumber(counts?.failed ?? 0)} failed in the queue`}
        icon={Gauge}
        tone={(summary?.failureRate ?? 0) > 0 ? "rose" : "emerald"}
        loading={loading}
      />
    </div>
  );
}
