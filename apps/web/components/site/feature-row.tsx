import { ArrowRight, Braces, Server, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const layers = [
  {
    number: "01",
    title: "Next.js console",
    role: "The face 🎛️",
    description:
      "Server-rendered marketing, a same-origin BFF proxy, and a live console that polls job state every 2.5 seconds. No API keys in the browser.",
    icon: Braces,
    tags: ["App Router", "BFF proxy", "Geist"],
    accent: "text-lilac",
    ring: "border-violet/20 bg-violet/10",
  },
  {
    number: "02",
    title: "NestJS API",
    role: "The brain 🧠",
    description:
      "Validated DTOs, throttling, Swagger docs and structured logs. It writes the job to Postgres first, then enqueues a BullMQ entry — in that order.",
    icon: Server,
    tags: ["REST", "Swagger", "Prisma"],
    accent: "text-fuchsia",
    ring: "border-fuchsia/20 bg-fuchsia/10",
  },
  {
    number: "03",
    title: "BullMQ worker",
    role: "The muscle 💪",
    description:
      "A separate container with configurable concurrency, exponential retries, graceful SIGTERM and an event timeline for every stage.",
    icon: Workflow,
    tags: ["Redis", "BullMQ", "Health probe"],
    accent: "text-aqua",
    ring: "border-aqua/20 bg-aqua/10",
  },
] as const;

export function FeatureRow() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Layers, not a monolith"
          title={
            <>
              Three pieces. <span className="gradient-text">One clean handoff.</span> 🧩
            </>
          }
          description="Each service has exactly one job — and a health check to prove it. Scale the worker without touching the web tier; redeploy the API without rebuilding the frontend."
        />

        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-16 hidden h-px bg-gradient-to-r from-violet/0 via-fuchsia/40 to-aqua/0 md:block"
          />
          {layers.map((layer, index) => (
            <Reveal key={layer.title} delay={index * 90}>
              <GlassCard className="h-full p-6 pt-7">
                <div className="relative flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${layer.ring}`}>
                    <layer.icon className={`h-5 w-5 ${layer.accent}`} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-mist/35">{layer.number}</span>
                </div>

                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-mist/50">{layer.role}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{layer.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-mist">{layer.description}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {layer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-mist/65"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/architecture"
            className="group inline-flex items-center gap-2 text-[12.5px] text-lilac/80 transition-colors hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Trace a request end to end
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
