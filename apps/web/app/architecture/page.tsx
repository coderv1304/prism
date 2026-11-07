import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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
    title: "Browser to Next.js BFF",
    detail:
      "The console calls same-origin /api/v1/*. A Next.js route handler forwards the request to the private API host, so no API credentials or hostnames reach the browser.",
    code: "fetch('/api/v1/jobs')",
  },
  {
    step: "02",
    title: "API validates and persists",
    detail:
      "NestJS validates the payload with class-validator, writes the job and its first timeline event to PostgreSQL, then enqueues a BullMQ entry keyed by the job UUID.",
    code: "prisma.job.create() -> queue.add()",
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
      "A dedicated container claims the job, reports four progress checkpoints and writes a stage event. Concurrency is tuned with WORKER_CONCURRENCY.",
    code: "worker.concurrency = 4",
  },
  {
    step: "05",
    title: "Result lands in PostgreSQL",
    detail:
      "The worker persists the result, duration and terminal status. The console polls the job detail until it reaches completed or failed, then stops.",
    code: "GET /jobs/:id -> completed",
  },
] as const;

const endpoints = [
  { method: "POST", path: "/api/v1/jobs", purpose: "Create and enqueue a job", note: "12 req/min" },
  { method: "GET", path: "/api/v1/jobs", purpose: "List jobs with filters", note: "120 req/min" },
  { method: "GET", path: "/api/v1/jobs/:id", purpose: "Job detail and event timeline", note: "120 req/min" },
  { method: "POST", path: "/api/v1/jobs/:id/retry", purpose: "Re-enqueue a failed job", note: "12 req/min" },
  { method: "GET", path: "/api/v1/queue/stats", purpose: "Queue depth and aggregate metrics", note: "120 req/min" },
  { method: "GET", path: "/api/v1/health", purpose: "Liveness probe", note: "public" },
] as const;

const reliability = [
  {
    number: "01",
    title: "Application crashes",
    body: "Every container declares a restart policy. The API is stateless; the worker traps SIGTERM and drains in-flight jobs. BullMQ re-delivers jobs whose lock expires.",
    signal: "restart: unless-stopped",
  },
  {
    number: "02",
    title: "Secret exposure",
    body: "Local values live in a git-ignored .env. CI uses GitHub encrypted secrets plus Azure OIDC federated credentials, with no long-lived cloud keys and nothing baked into an image.",
    signal: "runtime injection",
  },
  {
    number: "03",
    title: "Database persistence",
    body: "A named PostgreSQL volume locally; Azure Database for PostgreSQL Flexible Server with managed backups in production. Losing Redis never loses job history.",
    signal: "named volume + backups",
  },
  {
    number: "04",
    title: "Deployment rollback",
    body: "Images are tagged with the commit SHA. Rollback is a workflow dispatch with the previous SHA, or shifting Container Apps to the prior revision. Migrations stay additive.",
    signal: "immutable SHA tags",
  },
  {
    number: "05",
    title: "Failing container triage",
    body: "Start with docker compose ps, then logs -f api worker. Health endpoints separate liveness from dependency readiness, and every request carries an x-request-id in structured logs.",
    signal: "logs + request ids",
  },
  {
    number: "06",
    title: "Health monitoring",
    body: "API /health and /health/ready, worker /health/ready, queue depth and failure rate. In Azure, Log Analytics collects container logs and alerts watch readiness and queue age.",
    signal: "probes + metrics",
  },
] as const;

const pipelineSteps = [
  "Push to main",
  "Lint, types, tests, build",
  "Buildx images",
  "Trivy scan",
  "Push GHCR, SHA tag",
  "Azure OIDC deploy",
  "Post-deploy smoke test",
] as const;

const azureTopology = [
  { label: "Container Apps environment", value: "web public, api internal, worker internal" },
  { label: "PostgreSQL Flexible Server", value: "managed backups, TLS required" },
  { label: "Azure Managed Redis", value: "Balanced_B0, TLS on port 10000, NoEviction" },
  { label: "Secrets and identity", value: "Container App secrets, GitHub OIDC" },
  { label: "Ingress", value: "HTTPS on the web app only, API stays internal" },
] as const;

const decisions = [
  {
    title: "PostgreSQL is the source of truth",
    body: "Redis can be flushed and the queue rebuilt. Job state, results and event history survive because they live in Postgres, not in a cache.",
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
    title: "No Kubernetes, on purpose",
    body: "Three stateless containers and two managed data services do not need a control plane. Compose locally, Container Apps in production, the same images in both.",
  },
  {
    title: "Synthetic workloads, real pipeline",
    body: "The report, normalize and digest jobs are deterministic demo work. Everything around them, including validation, queueing, retries, persistence and health, is production behaviour.",
  },
  {
    title: "Honest limitations",
    body: "There is no auth or RBAC yet, no per-tenant isolation, and progress uses polling. The README lists the next steps: OIDC login, SSE streaming, queue-depth autoscaling and OpenTelemetry.",
  },
] as const;

export default function ArchitecturePage() {
  return (
    <div className="relative overflow-x-clip">
      <SiteNav />
      <main id="main">
        <section className="border-b border-ink/15">
          <div className="shell pb-14 pt-14 sm:pb-16 sm:pt-20">
            <Badge>Under the hood</Badge>
            <h1 className="mt-7 max-w-4xl text-[clamp(2.5rem,5.6vw,4.4rem)] leading-[0.94] text-ink">
              Every hop accounted for.
              <br />
              <em className="italic text-rust">Every job recoverable.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-umber">
              Three containers, two data stores and one compose file. This page is the map: what talks to what, why the
              boundaries sit there, and what happens when a piece fails.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink/15 pt-5">
              {[
                "Next.js 15 BFF",
                "NestJS 11 API",
                "BullMQ worker",
                "PostgreSQL 16",
                "Azure Managed Redis",
                "Azure Container Apps",
              ].map((item) => (
                <li key={item} className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-umber">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/console" size="md">
                Open the console
                <span aria-hidden="true" className="text-[15px] leading-none">
                  →
                </span>
              </ButtonLink>
              <ButtonLink href="#reliability" variant="secondary" size="md">
                Reliability notes
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="shell">
            <figure>
              <div className="border border-ink/20 bg-ink p-2 sm:p-3">
                <img
                  src="/architecture.svg"
                  alt="Prism architecture: a browser talks to the Next.js console, which proxies to a private NestJS API. The API writes to PostgreSQL and enqueues BullMQ jobs in Redis. A separate worker consumes the queue and persists progress and results to PostgreSQL. GitHub Actions builds SHA-tagged images, scans them, publishes to GHCR and deploys to Azure Container Apps."
                  width={1200}
                  height={720}
                  className="h-auto w-full"
                  loading="eager"
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-3 border-t border-ink/15 pt-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-umber">
                  Figure 01 · deployment and request topology
                </span>
                <span className="font-mono text-[9px] text-umber">Solid request · dashed build and deploy</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="border-y border-ink/15 bg-paper-2 py-20 sm:py-24">
          <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeading
                align="left"
                eyebrow="The request path"
                title={
                  <>
                    One job,
                    <br />
                    <em className="italic text-rust">five hops.</em>
                  </>
                }
                description="The browser never talks to Redis or PostgreSQL directly. Each boundary has one owner, which is what makes failures debuggable."
              />
              <div className="mt-8 border border-ink/20 bg-paper p-4">
                <p className="label text-umber">Queue invariant</p>
                <p className="mt-2 font-mono text-[11px] leading-6 text-rust">BullMQ job id = PostgreSQL job uuid</p>
                <p className="mt-1.5 text-[11px] leading-6 text-umber">
                  Re-submitting the same id cannot create a duplicate queue entry, and a queue entry can always be
                  reconciled back to a database row.
                </p>
              </div>
            </div>

            <ol className="border-t border-ink/15">
              {requestPath.map((item) => (
                <li
                  key={item.step}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="font-display text-[22px] leading-none text-rust">{item.step}</span>
                  <div>
                    <h3 className="text-[16px] leading-snug text-ink">{item.title}</h3>
                    <p className="mt-2 max-w-2xl text-[13px] leading-6 text-umber">{item.detail}</p>
                    <code className="mt-3 inline-block border border-ink/15 bg-paper px-2 py-1 font-mono text-[9.5px] text-forest">
                      {item.code}
                    </code>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="api" className="border-b border-ink/15 py-20 sm:py-24">
          <div className="shell">
            <SectionHeading
              align="left"
              eyebrow="The API surface"
              title={
                <>
                  Small surface.
                  <br />
                  <em className="italic text-rust">Explicit contracts.</em>
                </>
              }
              description="Every response is typed in a shared contracts package consumed by the API, worker and console. Validation errors come back as an array under message."
            />

            <div className="mt-10 overflow-x-auto border border-ink/20">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/15 bg-paper-2 font-mono text-[9px] uppercase tracking-[0.12em] text-umber">
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
                      className="border-b border-ink/10 last:border-0 hover:bg-paper-2/60"
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className={
                            endpoint.method === "POST"
                              ? "border border-rust/30 bg-rust/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-rust"
                              : "border border-forest/30 bg-forest/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-forest"
                          }
                        >
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-ink/80">{endpoint.path}</td>
                      <td className="px-5 py-3.5 text-[11.5px] text-umber">{endpoint.purpose}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-[9.5px] text-umber">{endpoint.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[10.5px] text-umber">
              Swagger UI is available at <code className="font-mono text-[10px] text-forest">localhost:4000/api/docs</code>{" "}
              when running locally. The browser uses the BFF prefix{" "}
              <code className="font-mono text-[10px] text-forest">/api/v1</code>.
            </p>
          </div>
        </section>

        <section id="reliability" className="border-b border-ink/15 bg-ink py-20 text-paper sm:py-24">
          <div className="shell">
            <SectionHeading
              align="left"
              eyebrow="Task 5 · production behaviour"
              title={
                <>
                  What happens when
                  <br />
                  <em className="italic text-ochre">things go wrong.</em>
                </>
              }
              description="Reliability is not a checklist at the end. It is the reason each boundary exists. Here is the failure story for every moving part."
              className="[&_h2]:text-paper [&_p]:text-paper/60 [&_.label]:text-ochre"
            />

            <div className="mt-10 grid gap-x-12 md:grid-cols-2">
              {reliability.map((item) => (
                <div key={item.number} className="border-t border-paper/15 py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[10px] text-ochre">{item.number}</span>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-paper/35">
                      {item.signal}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[15px] text-paper">{item.title}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-paper/55">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="deployment" className="border-b border-ink/15 py-20 sm:py-24">
          <div className="shell">
            <SectionHeading
              align="left"
              eyebrow="CI/CD and cloud"
              title={
                <>
                  Push to main.
                  <br />
                  <em className="italic text-rust">Land in production.</em>
                </>
              }
              description="GitHub Actions builds only what changed, scans every image, tags with the commit SHA, deploys with OIDC, and verifies the public health endpoint afterwards."
            />

            <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 border border-ink/20 bg-paper-2 p-4">
              {pipelineSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="border border-ink/15 bg-paper px-3 py-2 font-mono text-[10px] text-ink/80">
                    {step}
                  </span>
                  {index < pipelineSteps.length - 1 ? (
                    <span className="font-mono text-[11px] text-umber" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="border border-ink/20 p-5">
                <h3 className="text-[14px] text-ink">Runtime configuration</h3>
                <p className="mt-1.5 text-[11.5px] leading-6 text-umber">
                  No secrets in the image. Values are injected by Compose locally and Container Apps secrets in Azure.
                </p>
                <pre className="mt-4 overflow-x-auto border border-ink/15 bg-ink p-4 font-mono text-[10.5px] leading-6 text-paper/65">
                  <span className="text-paper/30"># .env, never committed</span>
                  {"\n"}DATABASE_URL=postgresql://...{"\n"}REDIS_URL=rediss://...{"\n"}API_PORT=
                  <span className="text-ochre">4000</span>
                  {"\n"}FRONTEND_ORIGIN=https://prism.example.com{"\n"}API_INTERNAL_URL=http://api:4000{"\n"}
                  WORKER_CONCURRENCY=<span className="text-ochre">4</span>
                  {"\n"}JOB_STAGE_DELAY_MS=<span className="text-ochre">450</span>
                </pre>
              </div>

              <div className="border border-ink/20 p-5">
                <h3 className="text-[14px] text-ink">Azure topology</h3>
                <dl className="mt-4 border-t border-ink/15">
                  {azureTopology.map((row) => (
                    <div key={row.label} className="border-b border-ink/10 py-3">
                      <dt className="text-[11.5px] text-ink/80">{row.label}</dt>
                      <dd className="mt-0.5 text-[10.5px] leading-5 text-umber">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border border-ink/20 bg-paper-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11.5px] leading-6 text-umber">
                Infrastructure lives in <code className="font-mono text-[10.5px] text-forest">infra/azure</code>{" "}
                (Terraform). Deployment steps and rollback commands are in{" "}
                <code className="font-mono text-[10.5px] text-forest">README.md</code>.
              </p>
              <Link
                href="/console"
                className="shrink-0 border-b border-ink pb-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink hover:border-rust hover:text-rust"
              >
                See it running
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-ink/15 py-20 sm:py-24">
          <div className="shell">
            <SectionHeading
              align="left"
              eyebrow="Decisions and trade-offs"
              title={
                <>
                  Why it looks
                  <br />
                  <em className="italic text-rust">like this.</em>
                </>
              }
              description="Every architectural choice has a cost. These are the trade-offs made deliberately, plus the edges that would be next."
            />

            <div className="mt-10 grid gap-x-12 md:grid-cols-2">
              {decisions.map((decision, index) => (
                <div key={decision.title} className="border-t border-ink/15 py-6">
                  <span className="font-mono text-[9px] text-rust">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-[14px] text-ink">{decision.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-6 text-umber">{decision.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-16 text-paper sm:py-20">
          <div className="shell flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="label text-ochre">Next</p>
              <h2 className="mt-4 max-w-2xl text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1] text-paper">
                Ready to watch it move?
                <br />
                <em className="italic text-ochre">The queue is warm.</em>
              </h2>
              <p className="mt-4 max-w-lg text-[13px] leading-6 text-paper/55">
                Dispatch an insight report and follow it from queued to completed, the same way an operator would.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink
                href="/console"
                className="border-paper bg-paper text-ink hover:border-ochre hover:bg-ochre"
              >
                Open the live console
                <span aria-hidden="true" className="text-[15px] leading-none">
                  →
                </span>
              </ButtonLink>
              <Link
                href="/"
                className="border-b border-paper/30 pb-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/60 hover:border-paper hover:text-paper"
              >
                Back to overview
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
