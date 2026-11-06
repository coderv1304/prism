import { Check, Clock, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const rows = [
  {
    emoji: "📊",
    label: "Q3 revenue pulse",
    type: "insight-report",
    status: "active" as const,
    progress: 68,
    meta: "2,500 records",
  },
  {
    emoji: "🧹",
    label: "CRM import — legacy",
    type: "dataset-normalize",
    status: "queued" as const,
    progress: 0,
    meta: "12,000 records",
  },
  {
    emoji: "📮",
    label: "Weekly product digest",
    type: "digest-render",
    status: "complete" as const,
    progress: 100,
    meta: "1.8s",
  },
];

const bars = [28, 38, 32, 51, 44, 63, 58, 78, 69, 88, 74, 96, 82, 100, 91, 78];

export function HeroConsole() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div aria-hidden="true" className="absolute -inset-8 rounded-[40px] bg-violet/20 blur-[70px]" />

      <div className="glass-strong relative overflow-hidden rounded-[28px] p-1.5 shadow-[0_40px_120px_-40px_rgba(88,28,135,0.9)]">
        <div className="stripe absolute inset-x-0 top-0 z-20" />
        <div className="relative overflow-hidden rounded-[23px] border border-white/[0.07] bg-[#070511]/95">
          <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-20" />

          <div className="relative flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
            </div>
            <span className="font-mono text-[10px] tracking-[0.14em] text-mist/50">PRISM / CONSOLE</span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              live
            </span>
          </div>

          <div className="relative p-4 sm:p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">Queue throughput</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  1,284 <span className="text-[11px] font-normal text-mist/60">jobs / hr</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] text-emerald-300">
                <Sparkles className="h-3 w-3" />
                +18% this week
              </div>
            </div>

            <div className="mt-4 flex h-[68px] items-end gap-1.5" aria-hidden="true">
              {bars.map((height, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1 rounded-t-[3px] transition-all",
                    index > 11
                      ? "bg-gradient-to-t from-violet/40 to-fuchsia/80"
                      : "bg-gradient-to-t from-violet/20 to-violet/50",
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <div className="mt-5 space-y-2.5">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.045]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm">
                      <span aria-hidden="true">{row.emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[12px] font-medium text-white">{row.label}</p>
                        <span
                          className={cn(
                            "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                            row.status === "active" && "bg-fuchsia/10 text-fuchsia",
                            row.status === "queued" && "bg-amber/10 text-amber",
                            row.status === "complete" && "bg-emerald-400/10 text-emerald-300",
                          )}
                        >
                          {row.status === "active" ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
                          {row.status === "queued" ? <Clock className="h-2.5 w-2.5" /> : null}
                          {row.status === "complete" ? <Check className="h-2.5 w-2.5" /> : null}
                          {row.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="progress-track flex-1">
                          <div
                            className={cn("progress-fill", row.status === "queued" && "bg-none bg-amber/40")}
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="shrink-0 font-mono text-[9px] text-mist/50">{row.meta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-strong absolute -right-3 top-24 hidden animate-float-slow items-center gap-2.5 rounded-xl px-3.5 py-2.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] sm:flex lg:-right-8">
        <RefreshCw className="h-3.5 w-3.5 text-amber" />
        <div>
          <p className="text-[11px] font-medium text-white">Retry scheduled</p>
          <p className="font-mono text-[9px] text-mist/60">attempt 2 of 3 · backoff 4s</p>
        </div>
      </div>

      <div className="glass-strong absolute -bottom-4 -left-3 hidden animate-float-slow items-center gap-2.5 rounded-xl px-3.5 py-2.5 [animation-delay:-2.4s] sm:flex lg:-left-8">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <div>
          <p className="text-[11px] font-medium text-white">Worker heartbeat</p>
          <p className="font-mono text-[9px] text-mist/60">concurrency 4 · p95 42ms</p>
        </div>
      </div>
    </div>
  );
}
