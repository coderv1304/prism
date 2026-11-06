"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import type { HealthReport, JobDto, JobStatus, QueueStats } from "@prism/contracts";
import { api, ApiError } from "@/lib/api";
import { ButtonLink } from "@/components/ui/button";
import { OrbField } from "@/components/ui/orbs";
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
    <div className="relative min-h-screen overflow-x-clip">
      <OrbField variant="console" />
      <ConsoleHeader health={health} />

      <main id="main" className="shell relative z-10 pb-16 pt-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-lilac/70">
              <Sparkles className="h-3 w-3 text-fuchsia" />
              Live demo · async pipeline
            </p>
            <h1 className="mt-3 text-[clamp(2rem,4.6vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
              Job console <span className="gradient-text">🛰️</span>
            </h1>
            <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-mist">
              Dispatch a job, then watch it travel through Redis, the worker and PostgreSQL — with every stage on the
              record. Nothing here is mocked except the workload itself.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="#composer" variant="secondary" size="sm">
              New job
              <ArrowUpRight className="h-3.5 w-3.5" />
            </ButtonLink>
            <Link
              href="/architecture"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] text-mist transition-colors hover:text-white"
            >
              How this works
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
              <div>
                <p className="text-[12px] font-medium text-rose-200">The console cannot reach the API</p>
                <p className="mt-0.5 text-[11px] text-rose-200/60">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshNow}
              className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white transition-colors hover:bg-white/[0.08]"
            >
              <RefreshCw className="h-3 w-3" />
              Retry now
            </button>
          </div>
        ) : null}

        <div className="mt-6">
          <StatsRow stats={stats} loading={loading && !stats} />
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="xl:sticky xl:top-24">
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

        <div className="glass mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/40">Request path</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          {pipeline.map((node, index) => (
            <span key={node} className="flex items-center gap-2">
              <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-mist/60">
                {node}
              </span>
              {index < pipeline.length - 1 ? <ChevronRight className="h-2.5 w-2.5 text-mist/25" /> : null}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-mist/30">
            Same-origin from the browser — the API stays private.
          </span>
        </div>

        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-mist/30">
          Demo data · volumes reset with <code className="text-mist/50">docker compose down -v</code> · API docs at{" "}
          <code className="text-mist/50">localhost:4000/api/docs</code>
        </p>
      </main>

      <JobDrawer jobId={selectedJobId} onClose={closeDrawer} onChanged={handleChanged} />
    </div>
  );
}
