"use client";

import { AlertCircle, ChevronRight, Inbox, Loader2, Pause, Play, RefreshCw, Sparkles } from "lucide-react";
import type { JobDto, JobStatus } from "@prism/contracts";
import { JOB_STATUSES } from "@prism/contracts";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/cn";
import { formatDuration, relativeTime } from "@/lib/format";
import { jobEmoji, jobLabel, statusMeta } from "./job-meta";

type Filter = JobStatus | "all";

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  ...JOB_STATUSES.map((status) => ({ value: status, label: statusMeta[status].label })),
];

function JobRow({ job, onSelect }: { job: JobDto; onSelect: (id: string) => void }) {
  const meta = statusMeta[job.status];
  const StatusIcon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(job.id)}
      className="group flex w-full items-center gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.03] sm:px-5"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm"
        aria-hidden="true"
      >
        {jobEmoji(job.type)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[12.5px] font-medium text-white">{job.payload.label}</span>
          <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-mist/35 sm:inline">
            {jobLabel(job.type)}
          </span>
        </span>
        <span className="mt-1.5 flex items-center gap-2.5">
          <span className="progress-track h-1 w-full max-w-[180px]">
            <span
              className={cn("progress-fill block h-full", job.status === "queued" && "opacity-50")}
              style={{
                width: `${job.progress}%`,
                background:
                  job.status === "failed"
                    ? "linear-gradient(90deg,#fb7185,#f43f5e)"
                    : job.status === "queued"
                      ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                      : undefined,
              }}
            />
          </span>
          <span className="shrink-0 font-mono text-[9px] tabular text-mist/40">
            {job.status === "active" || job.status === "queued" ? `${job.progress}%` : formatDuration(job.durationMs)}
          </span>
        </span>
        {job.status === "failed" && job.error ? (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-rose-300/70">
            <AlertCircle className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{job.error}</span>
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          "hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] sm:flex",
          meta.badge,
        )}
      >
        <StatusIcon className={cn("h-2.5 w-2.5", job.status === "active" && "animate-spin")} />
        {meta.label}
      </span>

      <span className="hidden w-[62px] shrink-0 text-right font-mono text-[9.5px] text-mist/40 md:block">
        {relativeTime(job.createdAt)}
      </span>

      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-mist/25 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-mist/60" />
    </button>
  );
}

export function JobsPanel({
  jobs,
  total,
  filter,
  onFilterChange,
  loading,
  lastUpdated,
  paused,
  onTogglePaused,
  onRefresh,
  onSelect,
}: {
  jobs: JobDto[];
  total: number;
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  loading: boolean;
  lastUpdated: Date | null;
  paused: boolean;
  onTogglePaused: () => void;
  onRefresh: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <GlassCard className="overflow-hidden" interactive={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-6 sm:px-5">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            Job activity
            <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist/50">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", paused ? "bg-mist/40" : "animate-pulse bg-emerald-400")}
              />
              {paused ? "paused" : "live"}
            </span>
          </h2>
          <p className="mt-1 text-[10.5px] text-mist/45">
            {lastUpdated ? `Updated ${relativeTime(lastUpdated.toISOString())}` : "Waiting for the first sync…"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePaused}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-mist transition-colors hover:border-white/20 hover:text-white"
            aria-label={paused ? "Resume auto-refresh" : "Pause auto-refresh"}
            title={paused ? "Resume auto-refresh" : "Pause auto-refresh"}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-mist transition-colors hover:border-white/20 hover:text-white"
            aria-label="Refresh now"
            title="Refresh now"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto border-y border-white/[0.06] bg-white/[0.015] px-3 py-2">
        {filters.map((entry) => (
          <button
            key={entry.value}
            type="button"
            onClick={() => onFilterChange(entry.value)}
            aria-pressed={filter === entry.value}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              filter === entry.value
                ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "text-mist/60 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="min-h-[280px]">
        {loading && jobs.length === 0 ? (
          <div className="divide-y divide-white/[0.05]">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-3 px-5 py-4">
                <div className="h-9 w-9 rounded-xl bg-white/[0.05]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-1/3 rounded bg-white/[0.06]" />
                  <div className="h-1.5 w-2/3 rounded bg-white/[0.04]" />
                </div>
                <div className="h-5 w-16 rounded-full bg-white/[0.05]" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <Inbox className="h-5 w-5 text-mist/40" />
            </div>
            <p className="mt-4 text-[13px] font-medium text-white/85">
              {filter === "all" ? "Nothing in the queue yet" : `No ${filter} jobs`}
            </p>
            <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-mist/50">
              {filter === "all"
                ? "Dispatch your first job and watch it move from queued to completed."
                : "Switch the filter, or send a new job from the composer."}
            </p>
            <button
              type="button"
              onClick={() => {
                onFilterChange("all");
                document.getElementById("composer")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-violet/25 bg-violet/10 px-3 py-1.5 text-[11px] text-lilac transition-colors hover:bg-violet/15 hover:text-white"
            >
              <Sparkles className="h-3 w-3" />
              Dispatch a job
            </button>
          </div>
        ) : (
          <div>
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3 text-[10px] text-mist/40 sm:px-5">
        <span>
          Showing {jobs.length} of {total} job{total === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em]">
          {paused ? (
            <>
              <Pause className="h-2.5 w-2.5" /> auto-refresh paused
            </>
          ) : (
            <>
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> polling every 2.5s
            </>
          )}
        </span>
      </div>
    </GlassCard>
  );
}
