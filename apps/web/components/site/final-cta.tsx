import { ArrowRight, Terminal } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { OrbField } from "@/components/ui/orbs";
import { SparkleField } from "@/components/ui/sparkle-field";

export function FinalCta() {
  return (
    <section className="relative pb-24 pt-6 sm:pb-28">
      <div className="shell">
        <div className="glass-strong noise relative overflow-hidden rounded-[32px] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="stripe absolute inset-x-0 top-0 z-10" />
          <div
            aria-hidden="true"
            className="dot-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000,transparent_75%)]"
          />
          <OrbField variant="cta" />
          <SparkleField />

          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lilac/70">Your queue is waiting</p>
            <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.02] text-white">
              Put the heavy work down. <span className="gradient-text">Pick up momentum.</span> 🚀
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed text-mist">
              Spin up the whole stack locally in one command — or deploy the same images to Azure Container Apps.
              Retries, persistence and progress are already handled.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/console" size="lg">
                Open the live console
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="/architecture" variant="secondary" size="lg">
                <Terminal className="h-4 w-4 text-lilac" />
                Read the architecture
              </ButtonLink>
            </div>

            <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-3.5 py-2 font-mono text-[10.5px] text-mist/60">
              <span className="text-emerald-300">$</span>
              docker compose up --build
              <span className="h-3 w-px bg-white/10" />
              <span className="text-mist/35">~120s to healthy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
