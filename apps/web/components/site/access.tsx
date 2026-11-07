import { ButtonLink } from "@/components/ui/button";

const included = [
  "A public console and an internal API",
  "PostgreSQL as the system of record",
  "Azure Managed Redis for transport",
  "Terraform for the Azure stack",
  "GitHub Actions with OIDC deploy",
  "Health, smoke and rollback paths",
] as const;

export function Access() {
  return (
    <section id="access" className="border-b border-ink/15 bg-paper-2 py-20 sm:py-24">
      <div className="shell">
        <div className="grid gap-10 border border-forest/40 bg-forest px-6 py-10 text-paper sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-14 lg:py-16">
          <div>
            <p className="label text-paper/50">Access</p>
            <h2 className="mt-5 max-w-xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.98] text-paper">
              One system.
              <br />
              <em className="italic text-ochre">One way in.</em>
            </h2>
            <p className="mt-6 max-w-lg text-[14px] leading-7 text-paper/65">
              There is no free tier, no enterprise tier and no sales call. The public console is the product, the
              architecture page is the manual, and the repository is the whole thing.
            </p>

            <div className="mt-8 border border-paper/20 bg-ink/25 p-4">
              <p className="label text-paper/40">Start locally</p>
              <code className="mt-2 block font-mono text-[12px] text-paper/85">docker compose up --build</code>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/35">
                Six containers · migrations included · ~120s to healthy
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 border-t border-paper/20 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <ul className="space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-paper/10 pb-2.5 text-[12.5px] text-paper/75">
                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-ochre" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <ButtonLink
                href="/console"
                size="lg"
                className="border-paper bg-paper text-ink hover:border-ochre hover:bg-ochre"
              >
                Open the console
                <span aria-hidden="true" className="text-[15px] leading-none">
                  →
                </span>
              </ButtonLink>
              <ButtonLink
                href="/architecture"
                variant="secondary"
                size="lg"
                className="border-paper/35 text-paper hover:border-paper hover:bg-paper hover:text-ink"
              >
                Read the architecture
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
