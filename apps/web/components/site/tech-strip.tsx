const stack = [
  "Next.js 15",
  "NestJS 11",
  "PostgreSQL 16",
  "Azure Managed Redis",
  "BullMQ 5",
  "Docker",
  "Azure Container Apps",
  "GitHub Actions",
] as const;

export function TechStrip() {
  return (
    <section aria-label="Technology stack" className="border-b border-ink/15 bg-paper-2">
      <div className="shell flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="label shrink-0 text-umber">Runs on</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {stack.map((item, index) => (
            <li key={item} className="flex items-center gap-5">
              <span className="text-[12px] text-ink/75">{item}</span>
              {index < stack.length - 1 ? (
                <span className="h-3 w-px bg-ink/15" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
