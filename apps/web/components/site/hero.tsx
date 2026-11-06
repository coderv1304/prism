import { ArrowRight, GitBranch, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { OrbField } from "@/components/ui/orbs";
import { SparkleField } from "@/components/ui/sparkle-field";
import { HeroConsole } from "./hero-console";

const stats = [
  { value: "3×", label: "automatic retries" },
  { value: "4", label: "observable stages" },
  { value: "1", label: "command to boot" },
] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div aria-hidden="true" className="dot-grid mask-radial absolute inset-0 opacity-60" />
      <div
        aria-hidden="true"
        className="line-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,#000_0%,transparent_70%)]"
      />
      <OrbField />
      <SparkleField />

      <div className="shell relative z-10 grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div>
          <Badge className="animate-pulse-soft">v2.4 — priority queues are live</Badge>

          <h1 className="mt-6 text-[clamp(2.9rem,6.4vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em]">
            Heavy work.
            <br />
            <span className="gradient-text">Out of the way.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mist sm:text-[16.5px]">
            Prism queues, retries and streams your background jobs — so every request stays fast, every failure is
            visible, and nothing gets lost between deploys.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/console" size="lg">
              Open the live console
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/architecture" variant="secondary" size="lg">
              <GitBranch className="h-4 w-4 text-lilac" />
              See the architecture
            </ButtonLink>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[12px] text-mist/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" />
            No credit card — 2,000 jobs free. Every retry, log and result included.
          </p>

          <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/[0.08] border-t border-white/[0.08] pt-6">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 first:pl-0 last:pr-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist/50">{stat.label}</dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-tight text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <HeroConsole />
        </div>
      </div>
    </section>
  );
}
