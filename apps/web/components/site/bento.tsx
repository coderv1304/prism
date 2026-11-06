import { ArrowRight, Check, Clock3, Database, Eye, RefreshCw, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

const backoff = [
  { attempt: "1", delay: "2s", height: "34%" },
  { attempt: "2", delay: "4s", height: "58%" },
  { attempt: "3", delay: "8s", height: "88%" },
] as const;

const stages = ["Validating", "Loading", "Aggregating", "Persisting"] as const;

export function Bento() {
  return (
    <section id="product" className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/30 to-transparent"
      />
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Everything in the box"
            title={
              <>
                One queue. Zero
                <br />
                <span className="gradient-text">nasty surprises.</span> ✨
              </>
            }
            description="The unglamorous infrastructure that makes async work feel instant — queueing, retries, persistence and progress, already wired together."
          />
          <ButtonLink href="/console" variant="ghost" size="sm" className="self-start px-0 lg:self-auto">
            Explore the live console
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </ButtonLink>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          <Reveal className="md:col-span-6 lg:col-span-7">
            <GlassCard className="h-full p-6 pt-7 sm:p-7 sm:pt-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet/20 bg-violet/10">
                    <Zap className="h-[18px] w-[18px] text-lilac" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">Queue it, then forget it ⚡</h3>
                  <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-mist">
                    One HTTP call drops a job into Redis and returns in milliseconds. The worker picks it up, and
                    PostgreSQL remembers exactly what happened.
                  </p>
                </div>
                <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mist/60 sm:block">
                  &lt; 40ms enqueue
                </span>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  { label: "Insight report", state: "queued", tone: "amber" },
                  { label: "Dataset normalize", state: "processing", tone: "fuchsia" },
                  { label: "Digest render", state: "completed", tone: "emerald" },
                ].map((row, index) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#070511]/70 px-3 py-2.5"
                  >
                    <span className="font-mono text-[10px] text-mist/40">0{index + 1}</span>
                    <span className="flex-1 text-[12px] text-white/90">{row.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                        row.tone === "amber" && "bg-amber/10 text-amber",
                        row.tone === "fuchsia" && "bg-fuchsia/10 text-fuchsia",
                        row.tone === "emerald" && "bg-emerald-400/10 text-emerald-300",
                      )}
                    >
                      {row.state}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          <Reveal className="md:col-span-6 lg:col-span-5" delay={80}>
            <GlassCard className="h-full p-6 pt-7 sm:p-7 sm:pt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber/20 bg-amber/10">
                <RefreshCw className="h-[18px] w-[18px] text-amber" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Retries without the 3 a.m. pager 🔁</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
                Exponential backoff, three attempts, then a clean failure you can replay from the console.
              </p>

              <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#070511]/70 p-4">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-mist/45">
                  <span>Attempt</span>
                  <span>Backoff</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  {backoff.map((item) => (
                    <div key={item.attempt} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-16 w-full items-end">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-violet/25 via-fuchsia/50 to-fuchsia/80"
                          style={{ height: item.height }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-mist/50">#{item.attempt}</span>
                      <span className="font-mono text-[10px] text-white/80">{item.delay}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal className="md:col-span-3 lg:col-span-4" delay={120}>
            <GlassCard className="h-full p-6 pt-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-aqua/20 bg-aqua/10">
                <Database className="h-[18px] w-[18px] text-aqua" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Postgres keeps the receipts 🧾</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">
                Redis is the queue, not the truth. Every state change and event lands in Postgres — and survives a cache
                flush.
              </p>
              <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.06] bg-[#070511]/80 p-3 font-mono text-[10px] leading-5 text-mist/70">
                <p>
                  <span className="text-fuchsia">model</span> Job {"{"}
                </p>
                <p className="pl-3">
                  status <span className="text-aqua">JobStatus</span>
                </p>
                <p className="pl-3">
                  result <span className="text-aqua">Json?</span>
                </p>
                <p className="pl-3">
                  events <span className="text-aqua">JobEvent[]</span>
                </p>
                <p>{"}"}</p>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal className="md:col-span-3 lg:col-span-4" delay={160}>
            <GlassCard className="h-full p-6 pt-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia/20 bg-fuchsia/10">
                <Eye className="h-[18px] w-[18px] text-fuchsia" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Progress you can actually see 👀</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">
                Four stage checkpoints, streamed to the UI. No spinning loader pretending to be busy.
              </p>

              <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#070511]/70 p-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/85">Aggregating metrics</span>
                  <span className="font-mono text-fuchsia">72%</span>
                </div>
                <div className="progress-track mt-2.5">
                  <div className="progress-fill" style={{ width: "72%" }} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {stages.map((stage, index) => (
                    <div key={stage} className="flex flex-col items-center gap-1.5">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[8px]",
                          index < 2
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : index === 2
                              ? "border-fuchsia/40 bg-fuchsia/10 text-fuchsia"
                              : "border-white/10 bg-white/[0.03] text-mist/40",
                        )}
                      >
                        {index < 2 ? <Check className="h-2.5 w-2.5" /> : index + 1}
                      </span>
                      <span className="font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist/45">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal className="md:col-span-6 lg:col-span-4" delay={200}>
            <GlassCard className="h-full p-6 pt-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet/20 bg-violet/10">
                <Terminal className="h-[18px] w-[18px] text-lilac" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">The whole stack, one command 🐳</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">
                Postgres, Redis, API, worker and web — health-checked, volume-backed and ready in a single compose file.
              </p>
              <div className="mt-5 rounded-xl border border-white/[0.06] bg-[#070511]/80 p-3.5 font-mono text-[10.5px] leading-6">
                <p className="text-mist/50">
                  <span className="text-emerald-300">$</span> docker compose up --build
                </p>
                {["postgres", "redis", "api", "worker", "web"].map((service) => (
                  <p key={service} className="flex items-center justify-between">
                    <span className="text-white/75">{service}</span>
                    <span className="flex items-center gap-1.5 text-emerald-300/80">
                      <Check className="h-2.5 w-2.5" /> healthy
                    </span>
                  </p>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[11px] text-mist/50">
          <Clock3 className="h-3.5 w-3.5" />
          <span>
            Fresh clone to running stack in under two minutes — no cloud account required.{" "}
            <Link href="/architecture" className="text-lilac/80 underline-offset-4 hover:underline">
              Read the deployment notes
            </Link>
            .
          </span>
        </div>
      </div>
    </section>
  );
}
