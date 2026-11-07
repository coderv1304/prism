"use client";

import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { JOB_CATALOG, type JobDto, type JobType } from "@prism/contracts";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { GlassCard } from "@/components/ui/glass-card";

const presets = [1_000, 5_000, 10_000, 25_000] as const;

export function JobComposer({ onCreated }: { onCreated: (job: JobDto) => void }) {
  const [type, setType] = useState<JobType>("insight-report");
  const [label, setLabel] = useState("Q3 revenue pulse");
  const [records, setRecords] = useState<number>(JOB_CATALOG[0]?.defaultRecords ?? 2500);
  const [submitting, setSubmitting] = useState(false);
  const labelId = useId();
  const recordsId = useId();

  const definition = useMemo(() => JOB_CATALOG.find((entry) => entry.type === type) ?? JOB_CATALOG[0], [type]);
  const disabled = submitting || label.trim().length < 2 || records < 100;

  function selectType(next: JobType) {
    setType(next);
    const nextDefinition = JOB_CATALOG.find((entry) => entry.type === next);
    if (nextDefinition) setRecords(nextDefinition.defaultRecords);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !definition) return;

    setSubmitting(true);
    try {
      const job = await api.createJob({
        type,
        payload: { label: label.trim(), records },
      });
      toast.success("Job queued", {
        description: `${definition.label} · ${formatNumber(records)} records. Watch the timeline.`,
      });
      onCreated(job);
      setLabel("");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not reach the API. Is the stack running?";
      toast.error("Submission failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-5" interactive={false} id="composer">
      <div className="flex items-start justify-between gap-3 border-b border-paper/15 pb-4">
        <div>
          <h2 className="text-[16px] text-paper">Dispatch a job</h2>
          <p className="mt-1 font-mono text-[10px] text-paper/40">POST /api/v1/jobs</p>
        </div>
        <span className="border border-paper/15 bg-paper/[0.04] px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-paper/45">
          async
        </span>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <fieldset className="min-w-0">
          <legend className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">Job type</legend>
          <div className="space-y-1.5">
            {JOB_CATALOG.map((entry, index) => {
              const selected = entry.type === type;
              return (
                <button
                  key={entry.type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectType(entry.type)}
                  className={cn(
                    "flex w-full items-baseline gap-3 border px-3 py-2.5 text-left",
                    selected
                      ? "border-brass/50 bg-brass/[0.08]"
                      : "border-paper/10 bg-paper/[0.02] hover:border-paper/25",
                  )}
                >
                  <span className={cn("font-mono text-[9px]", selected ? "text-brass" : "text-paper/30")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[12px]", selected ? "text-paper" : "text-paper/75")}>
                      {entry.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-paper/35">{entry.blurb}</span>
                  </span>
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0",
                      selected ? "bg-brass" : "border border-paper/25",
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor={labelId}
            className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40"
          >
            <span>Job label</span>
            <span className="text-paper/25">{label.trim().length}/80</span>
          </label>
          <input
            id={labelId}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={80}
            placeholder="e.g. Friday revenue pulse"
            className="h-10 w-full border border-paper/15 bg-ink-soft px-3 text-[12px] text-paper placeholder:text-paper/25 focus:border-brass/60 focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor={recordsId} className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40">
              Record count
            </label>
            <span className="font-mono text-[11px] text-brass">{formatNumber(records)}</span>
          </div>
          <input
            id={recordsId}
            type="range"
            min={100}
            max={50_000}
            step={100}
            value={records}
            onChange={(event) => setRecords(Number(event.target.value))}
            className="range w-full cursor-pointer"
          />
          <div className="mt-2.5 flex gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRecords(preset)}
                className={cn(
                  "flex-1 border px-1.5 py-1 font-mono text-[9px]",
                  records === preset
                    ? "border-brass/50 bg-brass/15 text-paper"
                    : "border-paper/10 bg-paper/[0.02] text-paper/45 hover:text-paper",
                )}
              >
                {preset / 1000}k
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="flex h-11 w-full items-center justify-center gap-2 border border-brass bg-brass text-[13px] font-medium text-ink hover:border-paper hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin border border-ink/30 border-t-ink" aria-hidden="true" />
              Queueing
            </>
          ) : (
            <>
              Queue job
              <span aria-hidden="true" className="text-[15px] leading-none">
                →
              </span>
            </>
          )}
        </button>
      </form>

      <p className="mt-4 border-t border-paper/10 pt-3 text-[10px] leading-relaxed text-paper/35">
        This runs the real pipeline: validation, PostgreSQL write, Redis queue, worker stages and a persisted result.
      </p>
    </GlassCard>
  );
}
