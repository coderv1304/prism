import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Bug,
  Check,
  Cloud,
  Container,
  Database,
  GitBranch,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Lock,
  RefreshCw,
  Rocket,
  RotateCcw,
  ScanLine,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "How Prism works end to end: the Next.js BFF, NestJS API, BullMQ worker, PostgreSQL persistence, Redis queue, CI/CD pipeline and Azure deployment topology.",
  alternates: { canonical: "/architecture" },
};

const requestPath = [
  {
    step: "01",
    title: "Browser → Next.js BFF",
    detail:
      "The console calls same-origin /api/v1/*. A Next.js route handler forwards the request to the private API host, so no API credentials or hostnames reach the browser.",
    code: "fetch('/api/v1/jobs')",
  },
  {
    step: "02",
    title: "API validates + persists",
    detail:
      "NestJS validates the payload with class-validator, writes the job and its first timeline event to PostgreSQL, then enqueues a BullMQ entry keyed by the job UUID.",
    code: "prisma.job.create() → queue.add()",
  },
  {
    step: "03",
    title: "Redis holds the queue",
    detail:
      "Redis is the transport, not the source of truth. BullMQ owns ordering, attempts, exponential backoff and stalled-job recovery via job locks.",
    code: "QUEUE_NAME = prism-jobs",
  },
  {
    step: "04",
    title: "Worker processes",
    detail:
      "A dedicated container claims the job, reports four progress checkpoints, and writes stage events. Concurrency is tuned with WORKER_CONCURRENCY.",
    code: "worker.concurrency = 4",
  },
  {
    step: "05",
    title: "Result lands in Postgres",
    detail:
      "The worker persists the result, duration and terminal status. The console polls the job detail until it reaches completed or failed, then stops.",
    code: "GET /jobs/:id → completed",
  },
] as const;

const endpoints = [
  { method: "POST", path: "/api/v1/jobs", purpose: "Create and enqueue a job", note: "12 req/min" },
  { method: "GET", path: "/api/v1/jobs", purpose: "List jobs with filters", note: "120 req/min" },
  { method: "GET", path: "/api/v1/jobs/:id", purpose: "Job detail + event timeline", note: "120 req/min" },
  { method: "POST", path: "/api/v1/jobs/:id/retry", purpose: "Re-enqueue a failed job", note: "12 req/min" },
  { method: "GET", path: "/api/v1/queue/stats", purpose: "Queue depth + aggregate metrics", note: "120 req/min" },
  { method: "GET", path: "/api/v1/health", purpose: "Liveness probe", note: "public" },
] as const;

const reliability = [
  {
    title: "Application crashes",
    icon: RefreshCw,
    body: "Every container declares a restart policy. The API is stateless; the worker traps SIGTERM and drains in-flight jobs. BullMQ re-delivers jobs whose lock expires.",
    signal: "restart: unless-stopped",
  },
  {
    title: "Secret exposure",
    icon: KeyRound,
    body: "Local values live in a git-ignored .env. CI uses GitHub encrypted secrets plus Azure OIDC federated credentials — no long-lived cloud keys. Nothing sensitive is baked into an image.",
    signal: "runtime injection",
  },
  {
    title: "Database persistence",
    icon: HardDrive,
    body: "A named PostgreSQL volume locally; Azure Database for PostgreSQL Flexible Server with managed backups in production. Redis uses AOF, but losing it never loses job history.",
    signal: "named volume + backups",
  },
  {
    title: "Deployment rollback",
    icon: RotateCcw,
    body: "Images are tagged with the commit SHA. Rollback is a workflow dispatch with the previous SHA, or shifting Container Apps to the prior revision. Migrations stay additive.",
    signal: "immutable SHA tags",
  },
  {
    title: "Failing container triage",
    icon: Bug,
    body: "Start with docker compose ps, then logs -f api worker. Health endpoints separate liveness from dependency readiness, and every request carries an x-request-id in structured logs.",
    signal: "logs + request ids",
  },
  {
    title: "Health monitoring",
    icon: Activity,
    body: "API /health and /health/ready, worker /health/ready, queue depth and failure rate. In Azure, Log Analytics collects container logs and alerts watch readiness and queue age.",
    signal: "probes + metrics",
  },
] as const;

const pipelineSteps = [
  { label: "Push to main", icon: GitBranch },
  { label: "Lint · types · tests · build", icon: Check },
  { label: "Buildx images", icon: Container },
  { label: "Trivy scan", icon: ScanLine },
  { label: "Push GHCR · SHA tag", icon: Boxes },
  { label: "Azure OIDC deploy", icon: Cloud },
  { label: "Post-deploy smoke test", icon: Rocket },
] as const;

const decisions = [
  {
    title: "PostgreSQL is the source of truth",
    body: "Redis can be flushed and the queue rebuilt. Job state, results and event history survive because they live in Postgres — not in a cache.",
  },
  {
    title: "Polling beats a socket for this demo",
    body: "Stage-level progress changes every few hundred milliseconds to seconds. A 2.5s poll is simpler, cache-friendly and stops automatically on terminal states.",
  },
  {
    title: "A BFF keeps the API private",
    body: "The browser only knows same-origin routes. The API hostname stays on the container network, CORS disappears, and the upstream can move without a frontend rebuild.",
  },
  {
    title: "No Kubernetes — on purpose",
    body: "Three stateless containers and two managed data services do not need a control plane. Compose locally, Container Apps in production, same images in both.",
  },
  {
    title: "Synthetic workloads, real pipeline",
    body: "The report, normalize and digest jobs are deterministic demo work. Everything around them — validation, queueing, retries, persistence, health — is production behaviour.",
  },
  {
    title: "Honest limitations",
    body: "There is no auth/RBAC yet, no per-tenant isolation, and progress uses polling. The README lists the next steps: OIDC login, SSE streaming, queue-depth autoscaling and OpenTelemetry.",
  },
] as const;

export default function ArchitecturePage() {
  return (
    <div className="relative overflow-x-clip">
      <SiteNav />
      <main id="main">
        <section className="relative overflow-hidden pb-14 pt-36 sm:pt-40">
          <div aria-hidden="true" className="dot-grid mask-radial absolute inset-0 opacity-40" />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet/15 blur-[120px]"
          />
          <div className="shell relative">
            <Badge>Under the hood</Badge>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[0.99] tracking-[-0.045em] text-white">
              Every hop accounted for. <span className="gradient-text">Every job recoverable.</span> 🧭
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-mist">
              Three containers, two data stores and one compose file. This page is the map — what talks to what, why the
              boundaries sit there, and what happens when a piece fails.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Next.js 15 BFF",
                "NestJS 11 API",
                "BullMQ worker",
                "PostgreSQL 16",
                "Redis 7",
                "Azure Container Apps",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-mist/60"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/console" size="md">
                Open the console
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#reliability" variant="secondary" size="md">
                <ShieldCheck className="h-4 w-4 text-lilac" />
                Reliability notes
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="relative pb-20">
          <div className="shell">
            <Reveal>
              <GlassCard className="p-3 pt-4 sm:p-4 sm:pt-5" interactive={false}>
                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#06040e]">
                  <img
                    src="/architecture.svg"
                    alt="Prism architecture: a browser talks to the Next.js console, which proxies to a private NestJS API. The API writes to PostgreSQL and enqueues BullMQ jobs in Redis. A separate worker consumes the queue and persists progress and results to PostgreSQL. GitHub Actions builds SHA-tagged images, scans them, publishes to GHCR and deploys to Azure Container Apps."
                    width={1200}
                    height={720}
                    className="h-auto w-full"
                    loading="eager"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 pt-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/40">
                    Figure 01 — deployment &amp; request topology
                  </p>
                  <p className="text-[10px] text-mist/35">Solid = request path · dashed = build &amp; deploy path</p>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.012] py-20 sm:py-24">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                align="left"
                eyebrow="The request path"
                title={
                  <>
                    One job, <span className="gradient-text">five hops.</span> 🛤️
                  </>
                }
                description="The browser never talks to Redis or PostgreSQL directly. Each boundary has one owner, which is what makes failures debuggable."
              />
              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#06040e] p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/35">Queue invariant</p>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-lilac/80">
                  BullMQ job id === PostgreSQL job uuid
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-mist/50">
                  Re-submitting the same id cannot create a duplicate queue entry, and a queue entry can always be
                  reconciled back to a database row.
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              {requestPath.map((item, index) => (
                <Reveal key={item.step} delay={index * 60}>
                  <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.035]">
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet/25 bg-violet/10 font-mono text-[10px] text-lilac">
                        {item.step}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[13.5px] font-medium text-white">{item.title}</h3>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-mist">{item.detail}</p>
                        <code className="mt-3 inline-block rounded-md border border-white/[0.06] bg-[#05040c] px-2 py-1 font-mono text-[9.5px] text-aqua/70">
                          {item.code}
                        </code>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section id="api" className="py-20 sm:py-24">
          <div className="shell">
            <SectionHeading
              eyebrow="The API surface"
              title={
                <>
                  Small surface. <span className="gradient-text">Explicit contracts.</span> 📡
                </>
              }
              description="Every response is typed in a shared contracts package consumed by the API, worker and console. Validation errors come back as an array under message."
            />

            <Reveal className="mt-10">
              <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/[0.07] bg-white/[0.03] font-mono text-[9px] uppercase tracking-[0.12em] text-mist/45">
                        <th className="px-5 py-3 font-normal">Method</th>
                        <th className="px-5 py-3 font-normal">Path</th>
                        <th className="px-5 py-3 font-normal">Purpose</th>
                        <th className="px-5 py-3 text-right font-normal">Rate limit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoints.map((endpoint) => (
                        <tr
                          key={`${endpoint.method}-${endpoint.path}`}
                          className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${
                                endpoint.method === "POST"
                                  ? "border-fuchsia/25 bg-fuchsia/10 text-fuchsia"
                                  : "border-aqua/20 bg-aqua/10 text-aqua"
                              }`}
                            >
                              {endpoint.method}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-white/80">{endpoint.path}</td>
                          <td className="px-5 py-3.5 text-[11.5px] text-mist/70">{endpoint.purpose}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-[9.5px] text-mist/40">
                            {endpoint.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-3 text-[10.5px] text-mist/40">
                Swagger UI is available at <code className="text-lilac/70">localhost:4000/api/docs</code> when running
                locally. The browser uses the BFF prefix <code className="text-lilac/70">/api/v1</code>.
              </p>
            </Reveal>
          </div>
        </section>

        <section id="reliability" className="relative border-y border-white/[0.06] bg-[#05040c] py-20 sm:py-24">
          <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-25" />
          <div className="shell relative">
            <SectionHeading
              eyebrow="Task 5 · production behaviour"
              title={
                <>
                  What happens when <span className="gradient-text">things go wrong.</span> 🛡️
                </>
              }
              description="Reliability is not a checklist at the end — it is the reason each boundary exists. Here is the failure story for every moving part."
            />

            <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {reliability.map((item, index) => (
                <Reveal key={item.title} delay={index * 50}>
                  <GlassCard className="h-full p-5 pt-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                        <item.icon className="h-4 w-4 text-lilac" />
                      </div>
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-mist/40">
                        {item.signal}
                      </span>
                    </div>
                    <h3 className="mt-4 text-[13.5px] font-medium text-white">{item.title}</h3>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist/70">{item.body}</p>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="deployment" className="py-20 sm:py-24">
          <div className="shell">
            <SectionHeading
              eyebrow="CI/CD & cloud"
              title={
                <>
                  Push to main. <span className="gradient-text">Land in production.</span> 🚀
                </>
              }
              description="GitHub Actions builds only what changed, scans every image, tags with the commit SHA, deploys with OIDC, and verifies the public health endpoint afterwards."
            />

            <Reveal className="mt-10">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
                {pipelineSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#070511] px-3 py-2">
                      <step.icon className="h-3.5 w-3.5 text-lilac" />
                      <span className="text-[11px] text-white/80">{step.label}</span>
                    </div>
                    {index < pipelineSteps.length - 1 ? <ArrowRight className="h-3 w-3 text-mist/25" /> : null}
                  </div>
                ))}
              </div>
            </Reveal>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <GlassCard className="p-5 pt-6">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-aqua" />
                  <h3 className="text-[13.5px] font-medium text-white">Runtime configuration</h3>
                </div>
                <p className="mt-1.5 text-[11.5px] text-mist/60">
                  No secrets in the image. Values are injected by Compose locally and Container Apps secrets in Azure.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#05040c] p-4 font-mono text-[10.5px] leading-6 text-mist/70">
                  <span className="text-mist/35"># .env — never committed</span>
                  {"\n"}DATABASE_URL=postgresql://…{"\n"}REDIS_URL=redis://…{"\n"}API_PORT=
                  <span className="text-amber">4000</span>
                  {"\n"}FRONTEND_ORIGIN=https://prism.example.com{"\n"}API_INTERNAL_URL=http://api:4000{"\n"}
                  WORKER_CONCURRENCY=<span className="text-amber">4</span>
                  {"\n"}JOB_STAGE_DELAY_MS=<span className="text-amber">450</span>
                </pre>
              </GlassCard>

              <GlassCard className="p-5 pt-6">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-fuchsia" />
                  <h3 className="text-[13.5px] font-medium text-white">Azure topology</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {[
                    {
                      icon: Container,
                      label: "Container Apps environment",
                      value: "web (public) · api (internal) · worker (internal)",
                    },
                    {
                      icon: Database,
                      label: "PostgreSQL Flexible Server",
                      value: "managed backups · private networking",
                    },
                    { icon: Layers, label: "Azure Cache for Redis", value: "Basic C0 for the demo · TLS enabled" },
                    { icon: Lock, label: "Secrets & identity", value: "Container App secrets · managed identity" },
                    { icon: Globe, label: "Ingress", value: "HTTPS on the web app only · API stays internal" },
                  ].map((row) => (
                    <li key={row.label} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                        <row.icon className="h-3.5 w-3.5 text-lilac" />
                      </span>
                      <div>
                        <p className="text-[11.5px] text-white/80">{row.label}</p>
                        <p className="text-[10.5px] text-mist/45">{row.value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            <Reveal className="mt-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-violet/15 bg-violet/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11.5px] text-mist/60">
                  Infrastructure lives in <code className="text-lilac/80">infra/azure</code> (Terraform). Deployment
                  steps and rollback commands are in <code className="text-lilac/80">README.md</code>.
                </p>
                <Link
                  href="/console"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-lilac transition-colors hover:text-white"
                >
                  See it running
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-white/[0.06] py-20 sm:py-24">
          <div className="shell">
            <SectionHeading
              eyebrow="Decisions & trade-offs"
              title={
                <>
                  Why it looks <span className="gradient-text">like this.</span> ⚖️
                </>
              }
              description="Every architectural choice has a cost. These are the trade-offs made deliberately — plus the edges that would be next."
            />

            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {decisions.map((decision, index) => (
                <Reveal key={decision.title} delay={index * 40}>
                  <div className="flex h-full items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                      <Check className="h-2.5 w-2.5 text-emerald-300" />
                    </span>
                    <div>
                      <h3 className="text-[12.5px] font-medium text-white">{decision.title}</h3>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist/65">{decision.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="shell">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
              <div className="stripe absolute inset-x-0 top-0" />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-fuchsia/15 blur-[90px]"
              />
              <div className="relative">
                <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-semibold text-white">
                  Ready to watch it move? <span className="gradient-text">The queue is warm.</span>
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[13px] text-mist">
                  Dispatch an insight report and follow it from queued to completed — the same way an operator would.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <ButtonLink href="/console">
                    Open the live console
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href="/" variant="secondary">
                    <Server className="h-4 w-4 text-lilac" />
                    Back to overview
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
