const stages = [
  { index: "01", name: "Queued", detail: "Redis · prism-jobs", time: "14:02:07", state: "done" },
  { index: "02", name: "Claimed", detail: "worker · concurrency 4", time: "14:02:08", state: "done" },
  { index: "03", name: "Rendering", detail: "2,500 records · stage 3 of 4", time: "14:02:09", state: "active" },
  { index: "04", name: "Persisted", detail: "PostgreSQL · checksum pending", time: "pending", state: "waiting" },
] as const;

export function JobLedger() {
  return (
    <figure className="relative">
      <div className="border border-ink/20 bg-ink text-paper">
        <div className="flex items-center justify-between border-b border-paper/15 px-5 py-3.5">
          <p className="label text-paper/55">Dispatch ledger</p>
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/55">
            <span className="h-1.5 w-1.5 bg-brass" aria-hidden="true" />
            Running
          </p>
        </div>

        <div className="px-5 pb-5 pt-6">
          <p className="label text-ember">Job 7 of 8,412</p>
          <h3 className="mt-3 font-display text-[26px] leading-tight text-paper">Q3 revenue pulse</h3>
          <p className="mt-1.5 font-mono text-[10px] text-paper/45">c718d656-47ca-441f-9b16-5bf5fabec306</p>

          <div className="mt-6 flex items-baseline justify-between">
            <span className="font-display text-[44px] leading-none text-paper">70%</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/45">1.9s elapsed</span>
          </div>
          <div className="mt-3 h-px w-full bg-paper/15" aria-hidden="true">
            <div className="h-px bg-ember" style={{ width: "70%" }} />
          </div>

          <ol className="mt-6">
            {stages.map((stage) => (
              <li
                key={stage.index}
                className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-t border-paper/10 py-3 first:border-t-0"
              >
                <span className="font-mono text-[10px] text-paper/35">{stage.index}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        stage.state === "done"
                          ? "h-1.5 w-1.5 shrink-0 bg-sage"
                          : stage.state === "active"
                            ? "h-1.5 w-1.5 shrink-0 bg-brass"
                            : "h-1.5 w-1.5 shrink-0 border border-paper/30"
                      }
                      aria-hidden="true"
                    />
                    <span
                      className={
                        stage.state === "waiting"
                          ? "text-[12.5px] text-paper/40"
                          : "text-[12.5px] text-paper/90"
                      }
                    >
                      {stage.name}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate pl-3.5 font-mono text-[9.5px] text-paper/40">
                    {stage.detail}
                  </span>
                </span>
                <span className="font-mono text-[9px] tabular text-paper/35">{stage.time}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between border-t border-paper/15 bg-paper/[0.03] px-5 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/40">Every stage on the record</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-brass">7 events</span>
        </div>
      </div>

      <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-umber">
          Figure 01 · a single job, observed
        </span>
        <span className="font-mono text-[9px] text-umber">Redis → worker → Postgres</span>
      </figcaption>
    </figure>
  );
}
