"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CalendarClock, Check, Copy, FileJson, Hash, Loader2, RotateCcw, Timer, X } from "lucide-react";
import { toast } from "sonner";
import type { JobDto } from "@prism/contracts";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { clockTime, formatDuration, formatNumber, relativeTime } from "@/lib/format";
import { jobEmoji, jobLabel, statusMeta } from "./job-meta";

export function JobDrawer({
  jobId,
  onClose,
  onChanged,
}: {
  jobId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [job, setJob] = useState<JobDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    setJob(null);
    setError(null);

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const next = await api.getJob(jobId);
        if (cancelled) return;
        setJob(next);
        setError(null);
        setLoading(false);

        // Only keep polling while the job can still change.
        if (next.status === "queued" || next.status === "active") {
          timer = setTimeout(tick, 2_000);
        }
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof ApiError ? cause.message : "Could not load this job.");
        setLoading(false);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, reloadKey]);

  useEffect(() => {
    if (!jobId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [jobId, onClose]);

  const handleRetry = useCallback(async () => {
    if (!job) return;
    setRetrying(true);
    try {
      await api.retryJob(job.id);
      toast.success("Retry queued", { description: "The worker will pick it up on the next pass." });
      onChanged();
      setReloadKey((key) => key + 1);
    } catch (cause) {
      toast.error("Retry failed", {
        description: cause instanceof ApiError ? cause.message : "The API did not accept the retry.",
      });
    } finally {
      setRetrying(false);
    }
  }, [job, onChanged]);

  async function copyResult() {
    if (!job?.result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(job.result, null, 2));
      setCopied(true);
      toast.success("Result copied to clipboard");
      setTimeout(() => setCopied(false), 1_800);
    } catch {
      toast.error("Clipboard is not available in this browser");
    }
  }

  if (!jobId) return null;

  const meta = job ? statusMeta[job.status] : null;
  const StatusIcon = meta?.icon;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-drawer-title"
        className="animate-slide-in absolute inset-y-0 right-0 flex w-full max-w-[540px] flex-col border-l border-white/[0.1] bg-[#070511]/95 shadow-[-40px_0_120px_-40px_rgba(0,0,0,0.9)]"
      >
        <div className="stripe absolute inset-x-0 top-0 z-10" />

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 pb-4 pt-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">
                {job ? jobEmoji(job.type) : "✦"}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45">
                {job ? jobLabel(job.type) : "Job detail"}
              </span>
            </div>
            <h2 id="job-drawer-title" className="mt-2 truncate text-[17px] font-semibold text-white">
              {job?.payload.label ?? "Loading job…"}
            </h2>
            {job ? <p className="mt-1 truncate font-mono text-[9.5px] text-mist/40">{job.id}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-mist transition-colors hover:border-white/20 hover:text-white"
            aria-label="Close job details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && !job ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-lilac" />
              <p className="mt-3 text-[12px] text-mist/60">Fetching the job timeline…</p>
            </div>
          ) : error && !job ? (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
              <div className="flex items-center gap-2 text-[12px] font-medium text-rose-200">
                <AlertTriangle className="h-4 w-4" />
                Could not load job
              </div>
              <p className="mt-1.5 text-[11.5px] text-rose-200/60">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white"
              >
                Try again
              </button>
            </div>
          ) : job && meta && StatusIcon ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em]",
                      meta.badge,
                    )}
                  >
                    <StatusIcon className={cn("h-3 w-3", job.status === "active" && "animate-spin")} />
                    {meta.label}
                  </span>
                  <span className="font-mono text-[11px] tabular text-mist/60">{job.progress}%</span>
                </div>
                <div className="progress-track mt-3">
                  <div
                    className="progress-fill"
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
                </div>
                <p className="mt-3 text-[11px] text-mist/55">
                  {job.status === "queued"
                    ? "Waiting for a free worker slot — retries and ordering are managed by BullMQ."
                    : job.status === "active"
                      ? "A worker is on it. Progress is written to PostgreSQL at every stage."
                      : job.status === "completed"
                        ? `Finished in ${formatDuration(job.durationMs)} — result persisted to PostgreSQL.`
                        : `Failed after ${job.attempts} attempt${job.attempts === 1 ? "" : "s"}. Review the error, then retry.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Attempts", value: String(job.attempts), icon: Hash },
                  { label: "Duration", value: formatDuration(job.durationMs), icon: Timer },
                  { label: "Records", value: formatNumber(job.payload.records), icon: FileJson },
                  { label: "Created", value: relativeTime(job.createdAt), icon: CalendarClock },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-mist/40">
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </div>
                    <p className="mt-1.5 font-mono text-[12px] text-white/85">{item.value}</p>
                  </div>
                ))}
              </div>

              {job.error ? (
                <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-rose-200/80">
                    <AlertTriangle className="h-3 w-3" />
                    Last error
                  </div>
                  <p className="mt-2 break-words font-mono text-[10.5px] leading-relaxed text-rose-100/70">
                    {job.error}
                  </p>
                </div>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45">Timeline</h3>
                  <span className="font-mono text-[9px] text-mist/30">{job.events?.length ?? 0} events</span>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
                  {job.events && job.events.length > 0 ? (
                    <ol className="relative space-y-4">
                      <span aria-hidden="true" className="absolute bottom-2 left-[3.5px] top-2 w-px bg-white/[0.07]" />
                      {job.events.map((event) => (
                        <li key={event.id} className="relative flex gap-3">
                          <span
                            className={cn(
                              "relative z-10 mt-1 h-2 w-2 shrink-0 rounded-full ring-4 ring-[#0a0814]",
                              event.kind === "error" && "bg-rose-400",
                              event.kind === "warning" && "bg-amber",
                              event.kind === "progress" && "bg-fuchsia/70",
                              event.kind === "lifecycle" && "bg-violet",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11.5px] leading-snug text-white/80">{event.message}</p>
                            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-mist/35">
                              {clockTime(event.createdAt)} · {relativeTime(event.createdAt)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[11px] text-mist/40">No events recorded yet.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45">Result</h3>
                  {job.result ? (
                    <button
                      type="button"
                      onClick={copyResult}
                      className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-mist/60 transition-colors hover:text-white"
                    >
                      {copied ? <Check className="h-2.5 w-2.5 text-emerald-300" /> : <Copy className="h-2.5 w-2.5" />}
                      {copied ? "copied" : "copy json"}
                    </button>
                  ) : null}
                </div>
                <pre className="max-h-[220px] overflow-auto rounded-2xl border border-white/[0.06] bg-[#05040c] p-4 font-mono text-[10.5px] leading-relaxed text-emerald-200/80">
                  {job.result
                    ? JSON.stringify(job.result, null, 2)
                    : "// pending — the worker will persist the result here"}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45">Payload</h3>
                <pre className="overflow-auto rounded-2xl border border-white/[0.06] bg-[#05040c] p-4 font-mono text-[10.5px] leading-relaxed text-mist/70">
                  {JSON.stringify(job.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] bg-[#060410]/80 px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-mist/35">
            {job?.finishedAt ? `finished ${clockTime(job.finishedAt)}` : "worker pipeline"}
          </p>
          {job?.status === "failed" ? (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 rounded-full bg-[linear-gradient(100deg,#8b5cf6,#d946ef)] px-4 py-2 text-[11.5px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(217,70,239,0.8)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {retrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              Retry job
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-mist/45">
              {StatusIcon ? <StatusIcon className="h-3 w-3" /> : null}
              {meta?.label ?? "loading"}
            </span>
          )}
        </div>
      </aside>
    </div>
  );
}
