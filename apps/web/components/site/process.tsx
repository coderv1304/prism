import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    number: "01",
    title: "Browser to BFF",
    body: "The console calls a same-origin route. Next.js forwards it to the private API host, so no internal hostname reaches the client.",
    code: "fetch('/api/v1/jobs')",
  },
  {
    number: "02",
    title: "Validated and written",
    body: "NestJS checks the payload, writes the job and its first event to PostgreSQL, then enqueues a BullMQ entry keyed by the job UUID.",
    code: "prisma.job.create()",
  },
  {
    number: "03",
    title: "Redis holds the work",
    body: "BullMQ owns ordering, attempts, backoff and stalled-job recovery. The queue is durable transport, not the system of record.",
    code: "prism-jobs",
  },
  {
    number: "04",
    title: "The worker reports",
    body: "A dedicated container claims the job, posts four progress checkpoints and writes a stage event at each one.",
    code: "worker.concurrency = 4",
  },
  {
    number: "05",
    title: "The result lands",
    body: "Duration, status and result are persisted. The console polls until the job reaches completed or failed, then stops.",
    code: "GET /api/v1/jobs/:id",
  },
] as const;

export function Process() {
  return (
    <section id="how-it-works" className="border-b border-ink/15 bg-ink py-20 text-paper sm:py-24">
      <div className="shell">
        <div className="flex flex-col justify-between gap-8 border-b border-paper/15 pb-10 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="The request path"
            title={
              <>
                One job, five hops,
                <br />
                <em className="italic text-ochre">nothing unobserved.</em>
              </>
            }
            className="[&_h2]:text-paper [&_p]:text-paper/60 [&_.label]:text-ochre"
          />
          <p className="max-w-sm font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-paper/40">
            Solid lines are requests.
            <br />
            Everything else is a record.
          </p>
        </div>

        <ol className="grid gap-px sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))]">
          {steps.map((step) => (
            <li key={step.number} className="border-t border-paper/15 py-7 lg:border-l lg:border-t-0 lg:px-5 lg:py-8 lg:first:border-l-0 lg:first:pl-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[30px] leading-none text-ochre">{step.number}</span>
                <span className="h-1.5 w-1.5 bg-forest" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-[14px] leading-snug text-paper">{step.title}</h3>
              <p className="mt-2.5 text-[12px] leading-6 text-paper/55">{step.body}</p>
              <code className="mt-4 block border-t border-paper/10 pt-3 font-mono text-[9.5px] text-paper/40">
                {step.code}
              </code>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
