import { ArrowRight, CornerDownRight, Radio, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    number: "01",
    title: "Submit a request",
    description: "Pick a job type, name it, choose a record count. The console POSTs a validated payload.",
    tag: "POST /api/v1/jobs",
  },
  {
    number: "02",
    title: "Persist, then enqueue",
    description: "The API writes the job and its first event to PostgreSQL before handing BullMQ a Redis entry.",
    tag: "prisma.job.create()",
  },
  {
    number: "03",
    title: "Work it off the queue",
    description: "A dedicated worker picks up the job, reports four progress stages, and retries on failure.",
    tag: "worker.process()",
  },
  {
    number: "04",
    title: "Watch it land",
    description: "The console polls the job, renders the timeline, and shows the result — no page refresh required.",
    tag: "GET /jobs/:id",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-y border-white/[0.06] bg-[#05040c] py-24 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="dot-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_40%,#000,transparent_75%)]"
      />
      <div className="shell relative grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <SectionHeading
            align="left"
            eyebrow="From click to completed"
            title={
              <>
                Four steps. <span className="gradient-text">No mystery.</span> 🪄
              </>
            }
            description="The same path runs locally and in the cloud — no hidden queues, no magic callbacks. You can trace every job from the HTTP request to the persisted result."
          />

          <ol className="mt-10 space-y-1">
            {steps.map((step, index) => (
              <li key={step.number} className="relative flex gap-4 pb-7 last:pb-0">
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[17px] top-9 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-violet/40 to-white/[0.04]"
                  />
                ) : null}
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0a0716] font-mono text-[10px] text-lilac shadow-[0_0_20px_rgba(139,92,246,0.18)]">
                  {step.number}
                </span>
                <div className="pt-0.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-[15px] font-medium text-white">{step.title}</h3>
                    <code className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9.5px] text-lilac/70">
                      {step.tag}
                    </code>
                  </div>
                  <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-mist">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Reveal delay={120}>
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[36px] bg-fuchsia/10 blur-[60px]" />
            <div className="code-window relative">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff5f57]/60" />
                  <span className="h-2 w-2 rounded-full bg-[#febc2e]/60" />
                  <span className="h-2 w-2 rounded-full bg-[#28c840]/60" />
                </div>
                <span className="font-mono text-[10px] text-mist/50">jobs.http</span>
                <Radio className="h-3.5 w-3.5 text-emerald-300/70" />
              </div>

              <div className="p-5 font-mono text-[11.5px] leading-6 sm:p-6">
                <p className="text-mist/40"># create a job</p>
                <p>
                  <span className="text-fuchsia">POST</span> <span className="text-white/85">/api/v1/jobs</span>{" "}
                  <span className="text-mist/40">HTTP/1.1</span>
                </p>
                <p className="mt-3 text-mist/60">{"{"}</p>
                <p className="pl-4 text-mist/80">
                  <span className="text-aqua">&quot;type&quot;</span>:{" "}
                  <span className="text-emerald-300/90">&quot;insight-report&quot;</span>,
                </p>
                <p className="pl-4 text-mist/80">
                  <span className="text-aqua">&quot;payload&quot;</span>: {"{"}
                </p>
                <p className="pl-8 text-mist/80">
                  <span className="text-aqua">&quot;label&quot;</span>:{" "}
                  <span className="text-emerald-300/90">&quot;Q3 revenue pulse&quot;</span>,
                </p>
                <p className="pl-8 text-mist/80">
                  <span className="text-aqua">&quot;records&quot;</span>: <span className="text-amber">2500</span>
                </p>
                <p className="pl-4 text-mist/80">{"}"}</p>
                <p className="text-mist/60">{"}"}</p>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-emerald-300">
                    <CornerDownRight className="h-2.5 w-2.5" /> 201 Created
                  </span>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <p className="text-mist/60">{"{"}</p>
                <p className="pl-4 text-mist/80">
                  <span className="text-aqua">&quot;id&quot;</span>:{" "}
                  <span className="text-emerald-300/90">&quot;8f14e45f-…&quot;</span>,
                </p>
                <p className="pl-4 text-mist/80">
                  <span className="text-aqua">&quot;status&quot;</span>:{" "}
                  <span className="text-amber">&quot;queued&quot;</span>,
                </p>
                <p className="pl-4 text-mist/80">
                  <span className="text-aqua">&quot;progress&quot;</span>: <span className="text-amber">0</span>,
                </p>
                <p className="pl-4 text-mist/80">
                  <span className="text-aqua">&quot;events&quot;</span>: <span className="text-mist/50">[ … ]</span>
                </p>
                <p className="text-mist/60">{"}"}</p>

                <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] text-mist/45">
                  <Sparkles className="h-3 w-3 text-fuchsia/70" />
                  Worker picked it up in 180ms — status is now active.
                </div>
              </div>
            </div>

            <div className="glass-strong absolute -bottom-5 right-4 hidden items-center gap-3 rounded-xl px-4 py-3 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia" />
              </span>
              <span className="text-[11px] text-white/85">Want to send one yourself?</span>
              <ButtonLink href="/console" size="sm" className="h-7 px-3 text-[11px]">
                Try it
                <ArrowRight className="h-3 w-3" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
