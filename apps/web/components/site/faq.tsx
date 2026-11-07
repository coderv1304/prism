import { SectionHeading } from "@/components/ui/section-heading";

const faqs = [
  {
    question: "Do I need PostgreSQL and Redis installed to run this?",
    answer:
      "No. Both are services in docker-compose.yml with named volumes and health checks. One command starts the stack, runs the migration and leaves the console at localhost:3000.",
  },
  {
    question: "What happens if the worker crashes mid-job?",
    answer:
      "BullMQ holds a renewable lock on an active job. If the worker dies, the job is marked stalled and delivered again after the lock expires. PostgreSQL keeps the last known state and the full event timeline, so nothing disappears silently.",
  },
  {
    question: "How are secrets kept out of the repository and images?",
    answer:
      "Local development reads a git-ignored .env file. CI uses GitHub encrypted secrets and Azure OIDC federated credentials, with no long-lived cloud keys. Database and Redis credentials are injected at runtime and never baked into a layer.",
  },
  {
    question: "Can this run without Kubernetes?",
    answer:
      "Yes, deliberately. Docker Compose covers local and single-VM deployments. Azure Container Apps runs the same images with managed ingress, secrets and revision rollback. A control plane would add operational surface this workload does not use.",
  },
  {
    question: "What is real and what is synthetic?",
    answer:
      "The workload is deterministic demo work: an insight report, a dataset normalisation and a digest render. Everything around it is real: validation, the Redis queue, retries, PostgreSQL persistence, health probes, image builds and the deployment workflow.",
  },
  {
    question: "How would a failed deployment be rolled back?",
    answer:
      "Images are tagged with the commit SHA. Rollback means dispatching the deploy workflow with the previous SHA, or moving the Container App to its previous revision. Migrations stay additive, so a rollback does not require a rebuild.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="border-b border-ink/15 py-20 sm:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="Questions"
            title={
              <>
                What the diagram
                <br />
                <em className="italic text-rust">does not answer.</em>
              </>
            }
            description="Failure modes, secret handling and the parts that are deliberately out of scope."
          />

          <div className="mt-8 border-t border-ink/15 pt-4">
            <p className="text-[12.5px] leading-6 text-umber">
              The full reliability story, including rollback commands and health probes, lives on the architecture page.
            </p>
            <a
              href="/architecture#reliability"
              className="mt-3 inline-block border-b border-ink pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink hover:border-rust hover:text-rust"
            >
              Read the reliability notes
            </a>
          </div>
        </div>

        <div className="border-t border-ink/15">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group border-b border-ink/15" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-[15px] leading-snug text-ink">{faq.question}</span>
                <span className="shrink-0 font-mono text-[14px] leading-none text-rust" aria-hidden="true">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-8 text-[13px] leading-6 text-umber">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
