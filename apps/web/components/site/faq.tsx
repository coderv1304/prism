import Link from "next/link";
import { ArrowUpRight, LifeBuoy, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SectionHeading } from "@/components/ui/section-heading";

const faqs = [
  {
    question: "Do I need Postgres and Redis installed to run this?",
    answer:
      "No. Both are services in docker-compose.yml, with named volumes, health checks and no published ports beyond localhost. One command starts the entire stack — migrations included.",
  },
  {
    question: "What happens if the worker crashes mid-job?",
    answer:
      "BullMQ holds a renewable lock on active jobs. If a worker dies, the job is marked stalled and re-delivered after the lock expires. PostgreSQL keeps the last known state and full event timeline, so nothing silently disappears.",
  },
  {
    question: "How are secrets kept out of the repository and images?",
    answer:
      "Local development reads a git-ignored .env file. CI/CD uses GitHub encrypted secrets and Azure OIDC federated credentials — no long-lived cloud keys. Database and Redis passwords are injected at runtime, never baked into a layer.",
  },
  {
    question: "Can this run without Kubernetes?",
    answer:
      "Yes — and that is deliberate. Docker Compose covers local and single-VM deployments. Azure Container Apps runs the same images with managed ingress, secrets and revision-based rollbacks. Kubernetes would add operational overhead this workload does not need.",
  },
  {
    question: "What is actually a demo here?",
    answer:
      "The pricing, testimonials and workload data. The infrastructure is real: request validation, Redis queueing, retries, Postgres persistence, health probes, image builds and deployment workflow all execute for real in the local stack.",
  },
  {
    question: "How would a failed deployment be rolled back?",
    answer:
      "Every image is tagged with the commit SHA. Rolling back means dispatching the deploy workflow with the previous SHA, or pointing the Azure Container App at its previous revision. No rebuild, no guesswork.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="relative border-t border-white/[0.06] py-24 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="Questions, answered"
            title={
              <>
                The details <span className="gradient-text">behind the demo.</span> 🧠
              </>
            }
            description="What is wired for real, what is illustrative, and what happens when the queue misbehaves at 3 a.m."
          />

          <GlassCard className="mt-8 p-5 pt-6" interactive={false}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet/20 bg-violet/10">
                <LifeBuoy className="h-4 w-4 text-lilac" />
              </div>
              <p className="text-[13px] font-medium text-white">Read the runbook</p>
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-mist">
              Failure modes, rollback steps, and the exact health checks used by Docker and Azure.
            </p>
            <Link
              href="/architecture#reliability"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-lilac/80 transition-colors hover:text-white"
            >
              Open reliability notes
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </GlassCard>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group glass overflow-hidden rounded-2xl border-white/[0.08] transition-colors hover:border-white/[0.14]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="text-[13.5px] font-medium text-white/90">{faq.question}</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <Plus className="h-3 w-3 text-lilac transition-transform duration-300 group-open:rotate-45" />
                </span>
              </summary>
              <div className="px-5 pb-5">
                <div className="stripe-soft mb-4" />
                <p className="text-[12.5px] leading-relaxed text-mist">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
