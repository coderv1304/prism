import { SectionHeading } from "@/components/ui/section-heading";

const principles = [
  {
    number: "01",
    title: "The database is the record",
    body: "Redis is transport. Every job, attempt, stage and result is written to PostgreSQL, so flushing the queue never erases history.",
    tag: "source of truth",
  },
  {
    number: "02",
    title: "One job, one identity",
    body: "The BullMQ job id is the PostgreSQL job UUID. A re-submitted request cannot create a duplicate queue entry, and every queue entry reconciles to a row.",
    tag: "no duplicates",
  },
  {
    number: "03",
    title: "Failures stay visible",
    body: "Each attempt records its error and timeline. Exponential backoff handles the transient cases; the permanent ones remain inspectable instead of vanishing.",
    tag: "3 retries",
  },
  {
    number: "04",
    title: "The browser never sees the API",
    body: "Same-origin route handlers forward to a private upstream. No CORS, no exposed internal hostname, no credentials in client code.",
    tag: "BFF boundary",
  },
  {
    number: "05",
    title: "Small enough to operate",
    body: "Three stateless containers and two managed data services. Docker Compose locally, Azure Container Apps in production, the same images in both.",
    tag: "no control plane",
  },
] as const;

export function Principles() {
  return (
    <section id="product" className="border-b border-ink/15 py-20 sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="The system"
            title={
              <>
                Five decisions that keep
                <br />
                <em className="italic text-rust">the queue honest.</em>
              </>
            }
            description="Prism is shaped by the constraints of background work: partial failure, duplicate delivery and the need to explain what happened after the fact."
          />
          <div className="mt-8 border-l-2 border-rust pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-umber">Invariant</p>
            <p className="mt-1.5 font-mono text-[11px] leading-5 text-ink/80">
              BullMQ job id = PostgreSQL job uuid
            </p>
          </div>
        </div>

        <ol>
          {principles.map((principle) => (
            <li
              key={principle.number}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-ink/15 py-6 first:border-t-0 first:pt-0 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6"
            >
              <span className="font-display text-[22px] leading-none text-rust">{principle.number}</span>
              <div>
                <h3 className="text-[17px] leading-snug text-ink">{principle.title}</h3>
                <p className="mt-2 max-w-xl text-[13px] leading-6 text-umber">{principle.body}</p>
              </div>
              <span className="col-start-2 mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-umber sm:col-start-3 sm:mt-1.5 sm:text-right">
                {principle.tag}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
