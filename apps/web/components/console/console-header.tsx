import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HealthReport } from "@prism/contracts";
import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

function HealthPill({ health }: { health: HealthReport | null }) {
  const status = health?.status ?? "unknown";
  const healthy = status === "ok";
  const degraded = status === "degraded";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em]",
        healthy && "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",
        degraded && "border-amber/25 bg-amber/10 text-amber",
        status === "unknown" && "border-white/10 bg-white/[0.04] text-mist/60",
      )}
      title={
        health
          ? `Database: ${health.services.database} · Redis: ${health.services.redis} · checked ${new Date(health.checkedAt).toLocaleTimeString()}`
          : "Health check pending"
      }
    >
      <span className="relative flex h-1.5 w-1.5">
        {healthy ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            healthy ? "bg-emerald-400" : degraded ? "bg-amber" : "bg-mist/50",
          )}
        />
      </span>
      {healthy ? "All systems nominal" : degraded ? "Degraded" : "Checking"}
    </span>
  );
}

export function ConsoleHeader({ health }: { health: HealthReport | null }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#05040b]/80 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Prism home">
            <Wordmark />
          </Link>
          <span className="hidden h-5 w-px bg-white/10 sm:block" />
          <span className="hidden items-center gap-1.5 text-[12px] text-mist sm:flex">
            Console
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-mist/50">
              live
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <HealthPill health={health} />
          <Link
            href="/architecture"
            className="hidden items-center gap-1 text-[12px] text-mist transition-colors hover:text-white sm:flex"
          >
            Architecture
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <ButtonLink href="/" variant="secondary" size="sm" className="hidden sm:inline-flex">
            Back to site
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
