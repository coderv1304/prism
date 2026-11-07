"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { HealthReport, JobDto, JobStatus, QueueStats } from "@prism/contracts";
import { api, ApiError } from "@/lib/api";
import { ButtonLink } from "@/components/ui/button";
import { ConsoleHeader } from "./console-header";
import { JobComposer } from "./job-composer";
import { JobDrawer } from "./job-drawer";
import { JobsPanel } from "./jobs-panel";
import { StatsRow } from "./stats-row";

type Filter = JobStatus | "all";

const pipeline = ["Browser", "Next.js BFF", "NestJS API", "Redis / BullMQ", "Worker", "PostgreSQL"] as const;

export function ConsoleShell() {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      if (typeof document !== "undefined" && document.hidden) {
        timer = setTimeout(load, 2_500);
        return;
      }

      try {
        const [list, statistics, healthReport] = await Promise.all([
          api.listJobs(filter === "all" ? undefined : filter, 25),
          api.getStats(),
          api.getHealth().catch(() => null),
        ]);

        if (cancelled) return;
        setJobs(list.data);
        setTotal(list.meta.total);
        setStats(statistics);
        if (healthReport) setHealth(healthReport);
        setLastUpdated(new Date());
        setError(null);
      } catch (cause) {
        if (cancelled) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "The Prism API is unreachable. Start the stack with docker compose up --build.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          if (!paused) timer = setTimeout(load, 2_500);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [filter, paused, refreshTick]);

  const refreshNow = useCallback(() => {
    setLoading(true);
    setRefreshTick((tick) => tick + 1);
  }, []);

  const handleChanged = useCallback(() => {
    setRefreshTick((tick) => tick + 1);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedJobId(null);
  }, []);

  const handleCreated = useCallback((job: JobDto) => {
    setFilter("all");
    setSelectedJobId(job.id);
    setRefreshTick((tick) => tick + 1);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-paper">
      <ConsoleHeader health={health} />

      <main id="main" className="shell relative pb-16 pt-28">
        <div className="flex flex-col justify-between gap-5 border-b border-paper/15 pb-7 md:flex-row md:items-end">
          <div>
            <p className="label text-brass">Live demo · async pipeline</p>
            <h1 className="mt-4 text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[0.98] text-paper">
              Job console <em className="italic text-brass">in motion.</em>
            </h1>
            <p className="mt-3 max-w-xl text-[13.5px] leading-6 text-mist">
              Dispatch a job, then watch it travel through Redis, the worker and PostgreSQL, with every stage on the
              record. Nothing here is mocked except the workload itself.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink
              href="#composer"
              variant="secondary"
              size="sm"
              className="border-paper/30 text-paper hover:border-brass hover:bg-brass hover:text-ink"
            >
              New job
            </ButtonLink>
            <Link
              href="/architecture"
              className="border-b border-paper/30 pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-mist hover:border-brass hover:text-paper"
            >
              How this works
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 flex flex-col gap-3 border border-ember/30 bg-ember/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-medium text-ember">The console cannot reach the API</p>
              <p className="mt-0.5 text-[11px] text-paper/50">{error}</p>
            </div>
            <button
              type="button"
              onClick={refreshNow}
              className="w-fit border border-paper/20 bg-paper/[0.04] px-3 py-1.5 text-[11px] text-paper hover:border-paper/40"
            >
              Retry now
            </button>
          </div>
        ) : null}

        <div className="mt-6">
          <StatsRow stats={stats} loading={loading && !stats} />
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="min-w-0 xl:sticky xl:top-24">
            <JobComposer onCreated={handleCreated} />
          </div>

          <JobsPanel
            jobs={jobs}
            total={total}
            filter={filter}
            onFilterChange={setFilter}
            loading={loading}
            lastUpdated={lastUpdated}
            paused={paused}
            onTogglePaused={() => setPaused((value) => !value)}
            onRefresh={refreshNow}
            onSelect={setSelectedJobId}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 border border-paper/15 px-4 py-3">
          <span className="label text-paper/35">Request path</span>
          <span className="hidden h-3 w-px bg-paper/15 sm:block" />
          {pipeline.map((node, index) => (
            <span key={node} className="flex items-center gap-2">
              <span className="border border-paper/10 bg-paper/[0.03] px-2 py-1 font-mono text-[9px] text-paper/55">
                {node}
              </span>
              {index < pipeline.length - 1 ? (
                <span className="font-mono text-[10px] text-paper/25" aria-hidden="true">
                  →
                </span>
              ) : null}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-paper/30">
            Same-origin from the browser. The API stays private.
          </span>
        </div>

        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-paper/25">
          Demo data · volumes reset with <code className="text-paper/45">docker compose down -v</code> · API docs at{" "}
          <code className="text-paper/45">localhost:4000/api/docs</code>
        </p>
      </main>

      <JobDrawer jobId={selectedJobId} onClose={closeDrawer} onChanged={handleChanged} />
    </div>
  );
}
