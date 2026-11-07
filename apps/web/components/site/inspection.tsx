import { SectionHeading } from "@/components/ui/section-heading";
import { LiveStatus } from "./live-status";

const facts = [
  { label: "Platform", value: "Azure Container Apps" },
  { label: "Region", value: "malaysiawest" },
  { label: "Database", value: "PostgreSQL 16 Flexible Server" },
  { label: "Queue", value: "Azure Managed Redis, TLS 10000" },
  { label: "Deploy", value: "GitHub OIDC, no stored cloud keys" },
  { label: "Images", value: "GHCR, immutable commit tags" },
] as const;

export function Inspection() {
  return (
    <section id="evidence" className="border-b border-ink/15 py-20 sm:py-24">
      <div className="shell">
        <SectionHeading
          align="left"
          eyebrow="Evidence"
          title={
            <>
              The deployment is
              <br />
              <em className="italic text-rust">the proof.</em>
            </>
          }
          description="No invented logos and no borrowed quotes. This is the running stack, the endpoint that reports it, and the smoke test that exercises it end to end."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <dl className="border-t border-ink/15">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-4 border-b border-ink/10 py-3.5 sm:grid-cols-[9rem_minmax(0,1fr)]"
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-umber">{fact.label}</dt>
                  <dd className="text-[13px] text-ink/85">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 border border-ink/20 bg-ink p-5 text-paper">
              <div className="flex items-center justify-between gap-4">
                <p className="label text-paper/50">Smoke test</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-sage">passed</p>
              </div>
              <pre className="mt-4 overflow-x-auto font-mono text-[10.5px] leading-6 text-paper/70">
                <span className="text-paper/35">$</span> npm run smoke{"\n"}
                <span className="text-sage">ok</span> health · database up · redis up{"\n"}
                <span className="text-sage">ok</span> job queued · c718d656{"\n"}
                <span className="text-sage">ok</span> completed in 1969ms · 7 events{"\n"}
                <span className="text-ochre">checksum</span> b7cfee4e
              </pre>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <LiveStatus />
            <p className="text-[12.5px] leading-6 text-umber">
              The console reads the same private API. Dispatch a job there and follow the timeline from queued to
              completed, or open the health report directly.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="/console"
                className="border-b border-ink pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink hover:border-rust hover:text-rust"
              >
                Open the console
              </a>
              <a
                href="/api/health"
                className="border-b border-ink/30 pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-umber hover:border-rust hover:text-rust"
              >
                Health report
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
