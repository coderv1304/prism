"use client";

import type { JobDto, JobStatus } from "@prism/contracts";
import { JOB_STATUSES } from "@prism/contracts";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/cn";
import { formatDuration, relativeTime } from "@/lib/format";
import { jobCode, jobLabel, statusMeta } from "./job-meta";

type Filter = JobStatus | "all";

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  ...JOB_STATUSES.map((status) => ({ value: status, label: statusMeta[status].label })),
];

function JobRow({ job, onSelect }: { job: JobDto; onSelect: (id: string) => void }) {
  const meta = statusMeta[job.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(job.id)}
      className="flex w-full items-center gap-3 border-b border-paper/10 px-4 py-3 text-left last:border-b-0 hover:bg-paper/[0.03] sm:px-5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-paper/15 font-mono text-[9px] tracking-[0.08em] text-paper/45">
        {jobCode(job.type)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[12.5px] text-paper/90">{job.payload.label}</span>
          <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-paper/30 sm:inline">
            {jobLabel(job.type)}
          </span>
        </span>
        <span className="mt-1.5 flex items-center gap-2.5">
          <span className="h-1 w-full max-w-[180px] bg-paper/10">
            <span
              className="block h-1"
              style={{
                width: `${job.progress}%`,
                backgroundColor:
                  job.status === "failed"
                    ? "#e0785c"
                    : job.status === "queued"
                      ? "#e0ae4e"
                      : "#8fc2a9",
              }}
            />
          </span>
          <span className="shrink-0 font-mono text-[9px] tabular text-paper/35">
            {job.status === "active" || job.status === "queued" ? `${job.progress}%` : formatDuration(job.durationMs)}
          </span>
        </span>
        {job.status === "failed" && job.error ? (
          <span className="mt-1 block truncate text-[10px] text-ember/75">{job.error}</span>
        ) : null}
      </span>

      <span
        className={cn(
          "hidden shrink-0 items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] sm:flex",
          meta.badge,
        )}
      >
        <span className={cn("h-1 w-1", meta.dot)} aria-hidden="true" />
        {meta.label}
      </span>

      <span className="hidden w-[62px] shrink-0 text-right font-mono text-[9.5px] text-paper/35 md:block">
        {relativeTime(job.createdAt)}
      </span>

      <span className="shrink-0 font-mono text-[11px] text-paper/25" aria-hidden="true">
        →
      </span>
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
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-5 sm:px-5">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] text-paper">
            Job activity
            <span className="flex items-center gap-1.5 border border-paper/10 bg-paper/[0.03] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-paper/40">
              <span className={cn("h-1 w-1", paused ? "bg-paper/30" : "bg-sage")} aria-hidden="true" />
              {paused ? "paused" : "live"}
            </span>
          </h2>
          <p className="mt-1 text-[10.5px] text-paper/35">
            {lastUpdated ? `Updated ${relativeTime(lastUpdated.toISOString())}` : "Waiting for the first sync"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePaused}
            className="h-8 border border-paper/10 bg-paper/[0.03] px-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-paper/50 hover:border-paper/25 hover:text-paper"
            aria-label={paused ? "Resume auto-refresh" : "Pause auto-refresh"}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="h-8 border border-paper/10 bg-paper/[0.03] px-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-paper/50 hover:border-paper/25 hover:text-paper"
            aria-label="Refresh now"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto border-y border-paper/10 bg-paper/[0.015] px-3 py-2">
        {filters.map((entry) => (
          <button
            key={entry.value}
            type="button"
            onClick={() => onFilterChange(entry.value)}
            aria-pressed={filter === entry.value}
            className={cn(
              "shrink-0 px-3 py-1.5 text-[11px]",
              filter === entry.value
                ? "bg-paper/10 text-paper"
                : "text-paper/45 hover:bg-paper/[0.04] hover:text-paper/80",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="min-h-[280px]">
        {loading && jobs.length === 0 ? (
          <div className="divide-y divide-paper/10">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-4">
                <div className="h-9 w-9 border border-paper/10 bg-paper/[0.03]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-1/3 bg-paper/[0.06]" />
                  <div className="h-1 w-2/3 bg-paper/[0.04]" />
                </div>
                <div className="h-5 w-16 border border-paper/10 bg-paper/[0.03]" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="font-display text-[44px] leading-none text-paper/15">00</p>
            <p className="mt-4 text-[13px] text-paper/80">
              {filter === "all" ? "Nothing in the queue yet" : `No ${filter} jobs`}
            </p>
            <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-paper/40">
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
              className="mt-4 border border-brass/30 bg-brass/10 px-3 py-1.5 text-[11px] text-brass hover:bg-brass/15"
            >
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-paper/10 px-4 py-3 text-[10px] text-paper/35 sm:px-5">
        <span>
          Showing {jobs.length} of {total} job{total === 1 ? "" : "s"}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.08em]">
          {paused ? "auto-refresh paused" : "polling every 2.5s"}
        </span>
      </div>
    </GlassCard>
  );
}
