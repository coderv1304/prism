"use client";

import { useEffect, useState } from "react";

type Health = {
  status?: string;
  version?: string;
  services?: { database?: string; redis?: string };
  checkedAt?: string;
};

type State = "loading" | "ok" | "degraded" | "unreachable";

function dot(state: State) {
  if (state === "ok") return "bg-forest";
  if (state === "degraded") return "bg-ochre";
  if (state === "unreachable") return "bg-rust";
  return "bg-umber/50";
}

export function LiveStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const body = (await response.json()) as Health;
        if (cancelled) return;
        setHealth(body);
        setState(body.status === "ok" ? "ok" : "degraded");
      } catch {
        if (!cancelled) setState("unreachable");
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const database = health?.services?.database ?? "unknown";
  const redis = health?.services?.redis ?? "unknown";
  const checkedAt = health?.checkedAt
    ? new Date(health.checkedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="border border-ink/20 bg-paper">
      <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3.5">
        <p className="label text-umber">Live deployment</p>
        <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-umber" aria-live="polite">
          <span className={`h-1.5 w-1.5 ${dot(state)}`} aria-hidden="true" />
          {state === "loading"
            ? "Checking"
            : state === "ok"
              ? "Healthy"
              : state === "degraded"
                ? "Degraded"
                : "Unreachable"}
        </p>
      </div>

      <dl className="divide-y divide-ink/10">
        {[
          { label: "API", value: state === "unreachable" ? "no response" : health?.status ?? "reading" },
          { label: "Database", value: database },
          { label: "Redis", value: redis },
          { label: "Region", value: "malaysiawest" },
          { label: "Version", value: health?.version ? health.version.slice(0, 12) : "reading" },
        ].map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-6 px-5 py-3">
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-umber">{row.label}</dt>
            <dd className="font-mono text-[11px] tabular text-ink/80">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-ink/15 bg-paper-2 px-5 py-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-umber">
          {checkedAt ? `Checked ${checkedAt}` : "Reading /api/health"}
        </span>
        <a
          href="/api/health"
          className="font-mono text-[9px] uppercase tracking-[0.12em] text-rust underline decoration-rust/40 underline-offset-4"
        >
          Raw report
        </a>
      </div>
    </div>
  );
}
