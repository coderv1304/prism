import { Quote, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const testimonials = [
  {
    quote: "We moved fourteen cron jobs onto Prism in an afternoon — the retry timeline alone paid for the migration.",
    name: "Maya Chen",
    role: "Staff Platform Engineer",
    company: "Northwind Labs",
    metric: "14 cron jobs retired",
    initials: "MC",
    gradient: "from-violet to-fuchsia",
  },
  {
    quote:
      "This is the first async UI our support team can actually read. Queue depth, failures, replay — no Grafana PhD required.",
    name: "Dev Patel",
    role: "Chief Technology Officer",
    company: "Lumen Health",
    metric: "Support escalations −42%",
    initials: "DP",
    gradient: "from-fuchsia to-aqua",
  },
  {
    quote:
      "Splitting the worker out let us scale ingest independently. API p95 went from 1.4 seconds to 220 milliseconds.",
    name: "Sofia Rossi",
    role: "Head of Engineering",
    company: "Cartogram",
    metric: "p95 1.4s → 220ms",
    initials: "SR",
    gradient: "from-aqua to-amber",
  },
] as const;

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-28">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-10 h-[340px] w-[640px] -translate-x-1/2 rounded-full bg-violet/10 blur-[110px]"
      />
      <div className="shell relative">
        <SectionHeading
          eyebrow="Proof from the queue"
          title={
            <>
              Teams that stopped <span className="gradient-text">babysitting queues.</span> 💬
            </>
          }
          description="Fictional teams, real infrastructure patterns. Every quote below is illustrative demo content — the architecture it describes is not."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 80}>
              <GlassCard className="flex h-full flex-col p-6 pt-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="h-3 w-3 fill-amber text-amber" aria-hidden="true" />
                    ))}
                  </div>
                  <Quote className="h-4 w-4 text-white/10" aria-hidden="true" />
                </div>

                <p className="mt-5 flex-1 text-[13.5px] leading-relaxed text-white/80">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-5 inline-flex w-fit rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-lilac/70">
                  {testimonial.metric}
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} font-mono text-[10px] font-semibold text-white`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-white">{testimonial.name}</p>
                    <p className="text-[10.5px] text-mist/60">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist/35">
          Illustrative testimonials · fictional companies · demo build
        </p>
      </div>
    </section>
  );
}
