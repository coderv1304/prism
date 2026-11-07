"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { JobDto } from "@prism/contracts";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { clockTime, formatDuration, formatNumber, relativeTime } from "@/lib/format";
import { jobCode, jobLabel, statusMeta } from "./job-meta";

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

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-ink/80" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-drawer-title"
        className="animate-slide-in absolute inset-y-0 right-0 flex w-full max-w-[540px] flex-col border-l border-paper/15 bg-ink-soft text-paper"
      >
        <div className="flex items-start justify-between gap-4 border-b border-paper/15 px-5 pb-4 pt-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center border border-paper/15 font-mono text-[8px] text-paper/50">
                {job ? jobCode(job.type) : "--"}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">
                {job ? jobLabel(job.type) : "Job detail"}
              </span>
            </div>
            <h2 id="job-drawer-title" className="mt-3 truncate font-display text-[20px] text-paper">
              {job?.payload.label ?? "Loading job"}
            </h2>
            {job ? <p className="mt-1 truncate font-mono text-[9.5px] text-paper/30">{job.id}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="h-8 shrink-0 border border-paper/15 bg-paper/[0.04] px-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-paper/60 hover:border-paper/35 hover:text-paper"
            aria-label="Close job details"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && !job ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="h-4 w-4 animate-spin border border-paper/25 border-t-brass" aria-hidden="true" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/45">
                Fetching the job timeline
              </p>
            </div>
          ) : error && !job ? (
            <div className="border border-ember/30 bg-ember/[0.06] p-4">
              <p className="text-[12px] font-medium text-ember">Could not load job</p>
              <p className="mt-1.5 text-[11.5px] text-paper/50">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-3 border border-paper/15 bg-paper/[0.04] px-3 py-1.5 text-[11px] text-paper"
              >
                Try again
              </button>
            </div>
          ) : job && meta ? (
            <div className="space-y-4">
              <div className="border border-paper/15 bg-paper/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em]",
                      meta.badge,
                    )}
                  >
                    <span className={cn("h-1 w-1", meta.dot)} aria-hidden="true" />
                    {meta.label}
                  </span>
                  <span className="font-mono text-[11px] tabular text-paper/50">{job.progress}%</span>
                </div>
                <div className="mt-3 h-1 bg-paper/10">
                  <div
                    className="h-1"
                    style={{
                      width: `${job.progress}%`,
                      backgroundColor:
                        job.status === "failed" ? "#e0785c" : job.status === "queued" ? "#e0ae4e" : "#8fc2a9",
                    }}
                  />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-paper/45">
                  {job.status === "queued"
                    ? "Waiting for a free worker slot. Retries and ordering are managed by BullMQ."
                    : job.status === "active"
                      ? "A worker is on it. Progress is written to PostgreSQL at every stage."
                      : job.status === "completed"
                        ? `Finished in ${formatDuration(job.durationMs)}. The result is persisted to PostgreSQL.`
                        : `Failed after ${job.attempts} attempt${job.attempts === 1 ? "" : "s"}. Review the error, then retry.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Attempts", value: String(job.attempts) },
                  { label: "Duration", value: formatDuration(job.durationMs) },
                  { label: "Records", value: formatNumber(job.payload.records) },
                  { label: "Created", value: relativeTime(job.createdAt) },
                ].map((item) => (
                  <div key={item.label} className="border border-paper/10 bg-paper/[0.02] p-3">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-paper/35">{item.label}</p>
                    <p className="mt-1.5 font-mono text-[12px] text-paper/80">{item.value}</p>
                  </div>
                ))}
              </div>

              {job.error ? (
                <div className="border border-ember/30 bg-ember/[0.06] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ember/85">Last error</p>
                  <p className="mt-2 break-words font-mono text-[10.5px] leading-relaxed text-paper/65">
                    {job.error}
                  </p>
                </div>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">Timeline</h3>
                  <span className="font-mono text-[9px] text-paper/25">{job.events?.length ?? 0} events</span>
                </div>
                <div className="border border-paper/10 bg-paper/[0.015] p-4">
                  {job.events && job.events.length > 0 ? (
                    <ol className="relative space-y-4">
                      <span aria-hidden="true" className="absolute bottom-2 left-[3.5px] top-2 w-px bg-paper/10" />
                      {job.events.map((event) => (
                        <li key={event.id} className="relative flex gap-3">
                          <span
                            className={cn(
                              "relative z-10 mt-1 h-2 w-2 shrink-0",
                              event.kind === "error" && "bg-ember",
                              event.kind === "warning" && "bg-brass",
                              event.kind === "progress" && "bg-sage/70",
                              event.kind === "lifecycle" && "bg-paper/50",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11.5px] leading-snug text-paper/75">{event.message}</p>
                            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-paper/30">
                              {clockTime(event.createdAt)} · {relativeTime(event.createdAt)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[11px] text-paper/35">No events recorded yet.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">Result</h3>
                  {job.result ? (
                    <button
                      type="button"
                      onClick={copyResult}
                      className="border border-paper/10 bg-paper/[0.03] px-2 py-1 font-mono text-[9px] text-paper/50 hover:border-paper/30 hover:text-paper"
                    >
                      {copied ? "Copied" : "Copy JSON"}
                    </button>
                  ) : null}
                </div>
                <pre className="max-h-[220px] overflow-auto border border-paper/10 bg-[#100d0a] p-4 font-mono text-[10.5px] leading-relaxed text-sage/80">
                  {job.result
                    ? JSON.stringify(job.result, null, 2)
                    : "// pending - the worker will persist the result here"}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">Payload</h3>
                <pre className="overflow-auto border border-paper/10 bg-[#100d0a] p-4 font-mono text-[10.5px] leading-relaxed text-paper/60">
                  {JSON.stringify(job.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-paper/15 bg-ink px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-paper/30">
            {job?.finishedAt ? `finished ${clockTime(job.finishedAt)}` : "worker pipeline"}
          </p>
          {job?.status === "failed" ? (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 border border-brass bg-brass px-4 py-2 text-[11.5px] font-medium text-ink hover:border-paper hover:bg-paper disabled:opacity-50"
            >
              {retrying ? (
                <span className="h-3 w-3 animate-spin border border-ink/30 border-t-ink" aria-hidden="true" />
              ) : null}
              Retry job
            </button>
          ) : (
            <span className="border border-paper/10 bg-paper/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-paper/40">
              {meta?.label ?? "loading"}
            </span>
          )}
        </div>
      </aside>
    </div>
  );
}
