import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { JobLedger } from "./ledger";

const facts = [
  { value: "3", label: "retries before failure" },
  { value: "4", label: "observable stages" },
  { value: "1", label: "record per job" },
] as const;

export function Hero() {
  return (
    <section id="top" className="relative border-b border-ink/15">
      <div className="shell grid gap-14 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pb-24 lg:pt-24">
        <div className="flex flex-col justify-center">
          <Badge>Async job infrastructure</Badge>

          <h1 className="mt-7 max-w-3xl text-[clamp(2.8rem,6.1vw,5.3rem)] leading-[0.92] text-ink">
            Background work,
            <br />
            <em className="italic text-rust">on the record.</em>
          </h1>

          <p className="mt-7 max-w-xl text-[15px] leading-7 text-umber">
            Prism takes the slow parts of a request and gives them a place to finish. Redis carries the queue,
            PostgreSQL keeps the evidence, and every job exposes the same four stages from dispatch to result.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/console" size="lg">
              Open the console
              <span aria-hidden="true" className="text-[15px] leading-none">
                →
              </span>
            </ButtonLink>
            <ButtonLink href="/architecture" variant="secondary" size="lg">
              Read the architecture
            </ButtonLink>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-ink/15 pt-6 sm:gap-8">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col">
                <dt className="order-last mt-1.5 max-w-[9rem] font-mono text-[9px] uppercase leading-4 tracking-[0.14em] text-umber">
                  {fact.label}
                </dt>
                <dd className="font-display text-[32px] leading-none text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex items-center">
          <JobLedger />
        </div>
      </div>
    </section>
  );
}
