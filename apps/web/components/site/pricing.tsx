"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

const tiers = [
  {
    name: "Starter",
    tagline: "For the side project that might become the company.",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    features: [
      "2,000 jobs per month",
      "3 concurrent jobs",
      "3 retries with backoff",
      "7-day event history",
      "Community support",
    ],
  },
  {
    name: "Growth",
    tagline: "For product teams shipping async work every day.",
    monthly: 29,
    yearly: 23,
    cta: "Start 14-day trial",
    popular: true,
    features: [
      "250,000 jobs per month",
      "Unlimited concurrency",
      "Priority queues",
      "30-day event history",
      "Daily database backups",
      "Email support — next business day",
    ],
  },
  {
    name: "Scale",
    tagline: "For platforms where the queue is load-bearing.",
    monthly: 99,
    yearly: 79,
    cta: "Talk to engineering",
    features: [
      "Unlimited jobs",
      "Dedicated worker pools",
      "SSO & audit log",
      "1-year event history",
      "99.99% uptime target",
      "Slack channel with engineers",
    ],
  },
] as const;

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-white/[0.06] py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 dot-grid opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000,transparent_80%)]"
      />
      <div className="shell relative">
        <SectionHeading
          eyebrow="Pricing that scales with the queue"
          title={
            <>
              Simple pricing. <span className="gradient-text">Serious throughput.</span> 💸
            </>
          }
          description="Start on the free tier, graduate when the queue earns it. Every plan includes retries, event history and the full console — no feature gates on reliability."
        />

        <div className="mt-8 flex justify-center">
          <div
            className="glass inline-flex items-center gap-1 rounded-full p-1"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={cn(
                "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                !annual ? "bg-white/10 text-white" : "text-mist hover:text-white",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                annual ? "bg-white/10 text-white" : "text-mist hover:text-white",
              )}
            >
              Yearly
              <span className="rounded-full bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300">
                −20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier, index) => {
            const price = annual ? tier.yearly : tier.monthly;
            const isPopular = "popular" in tier && tier.popular;

            return (
              <Reveal key={tier.name} delay={index * 80} className="h-full">
                <div
                  className={cn(
                    "relative h-full rounded-3xl",
                    isPopular && "popular-ring shadow-[0_30px_100px_-40px_rgba(168,85,247,0.55)] lg:-translate-y-2",
                  )}
                >
                  {isPopular ? (
                    <div className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[linear-gradient(100deg,#8b5cf6,#d946ef)] px-3 py-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-white shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Most popular
                    </div>
                  ) : null}

                  <GlassCard
                    stripe={!isPopular}
                    interactive={!isPopular}
                    className={cn("flex h-full flex-col p-6", isPopular ? "bg-[#0a0716] pt-8" : "pt-7")}
                  >
                    {isPopular ? <div className="stripe absolute inset-x-0 top-0 rounded-t-3xl" /> : null}

                    <div className="flex items-baseline justify-between">
                      <h3 className="text-[15px] font-semibold text-white">{tier.name}</h3>
                      {isPopular ? (
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-lilac/60">Growth</span>
                      ) : null}
                    </div>
                    <p className="mt-2 min-h-[40px] text-[12px] leading-relaxed text-mist">{tier.tagline}</p>

                    <div className="mt-6 flex items-end gap-1.5">
                      <span className="text-4xl font-semibold tracking-[-0.04em] text-white tabular">${price}</span>
                      <span className="pb-1.5 text-[11px] text-mist/60">
                        {price === 0 ? "forever" : "per seat / month"}
                      </span>
                    </div>
                    <p className="mt-1 min-h-[16px] font-mono text-[9.5px] uppercase tracking-[0.12em] text-mist/40">
                      {price === 0 ? "no card required" : annual ? "billed annually" : "billed monthly"}
                    </p>

                    <ButtonLink href="/console" variant={isPopular ? "primary" : "secondary"} className="mt-6 w-full">
                      {tier.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </ButtonLink>

                    <div className="mt-6 border-t border-white/[0.07] pt-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/40">
                        What&apos;s included
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-[12.5px] text-white/75">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                              <Check className="h-2.5 w-2.5 text-emerald-300" />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-8 text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist/35">
          Demo pricing · no payment is collected · usage measured per accepted job
        </p>
      </div>
    </section>
  );
}
