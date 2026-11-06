"use client";

import { useId, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, Sparkles } from "lucide-react";
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
        description: `${definition.label} · ${formatNumber(records)} records — watch the timeline.`,
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
    <GlassCard className="p-5 pt-6" interactive={false} id="composer">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
            Dispatch a job
            <Sparkles className="h-3.5 w-3.5 text-fuchsia" />
          </h2>
          <p className="mt-1 text-[11.5px] text-mist/60">POST /api/v1/jobs — validated, queued, observable.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-mist/50">
          async
        </span>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45">Job type</legend>
          <div className="space-y-2">
            {JOB_CATALOG.map((entry) => {
              const selected = entry.type === type;
              return (
                <button
                  key={entry.type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectType(entry.type)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300",
                    selected
                      ? "border-violet/40 bg-violet/[0.09] shadow-[0_0_0_1px_rgba(167,139,250,0.1)_inset]"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm"
                    aria-hidden="true"
                  >
                    {entry.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium text-white">{entry.label}</span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-mist/55">{entry.blurb}</span>
                  </span>
                  <span
                    className={cn(
                      "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-fuchsia bg-fuchsia" : "border-white/20",
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor={labelId}
            className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45"
          >
            <span>Job label</span>
            <span className="text-mist/30">{label.trim().length}/80</span>
          </label>
          <input
            id={labelId}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={80}
            placeholder="e.g. Friday revenue pulse"
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#070511]/80 px-3 text-[12px] text-white placeholder:text-mist/30 transition-colors focus:border-violet/50 focus:outline-none"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor={recordsId} className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/45">
              Record count
            </label>
            <span className="font-mono text-[11px] text-lilac">{formatNumber(records)}</span>
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
                  "flex-1 rounded-md border px-1.5 py-1 font-mono text-[9px] transition-colors",
                  records === preset
                    ? "border-violet/40 bg-violet/15 text-white"
                    : "border-white/[0.06] bg-white/[0.02] text-mist/50 hover:text-white",
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
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#8b5cf6,#c026d3_55%,#d946ef)] text-[13px] font-medium text-white shadow-[0_12px_36px_-14px_rgba(168,85,247,0.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Queueing…
            </>
          ) : (
            <>
              Queue job
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-mist/40">
        <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-fuchsia/60" />
        Runs the real pipeline — validation, Postgres write, Redis queue, worker stages, persisted result.
      </p>
    </GlassCard>
  );
}
