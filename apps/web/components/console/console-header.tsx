import Link from "next/link";
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
        "inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em]",
        healthy && "border-sage/30 bg-sage/10 text-sage",
        degraded && "border-brass/30 bg-brass/10 text-brass",
        status === "unknown" && "border-paper/15 bg-paper/[0.04] text-paper/50",
      )}
      title={
        health
          ? `Database: ${health.services.database} · Redis: ${health.services.redis} · checked ${new Date(health.checkedAt).toLocaleTimeString()}`
          : "Health check pending"
      }
    >
      <span
        className={cn(
          "h-1.5 w-1.5",
          healthy ? "bg-sage" : degraded ? "bg-brass" : "bg-paper/40",
        )}
        aria-hidden="true"
      />
      {healthy ? "All systems nominal" : degraded ? "Degraded" : "Checking"}
    </span>
  );
}

export function ConsoleHeader({ health }: { health: HealthReport | null }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-paper/15 bg-ink">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Prism home" className="text-paper">
            <Wordmark />
          </Link>
          <span className="hidden h-5 w-px bg-paper/15 sm:block" />
          <span className="hidden items-center gap-2 text-[12px] text-mist sm:flex">
            Console
            <span className="border border-paper/15 bg-paper/[0.04] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-paper/45">
              live
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <HealthPill health={health} />
          <Link
            href="/architecture"
            className="hidden border-b border-paper/25 pb-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-mist hover:border-brass hover:text-paper sm:flex"
          >
            Architecture
          </Link>
          <ButtonLink
            href="/"
            variant="secondary"
            size="sm"
            className="hidden border-paper/25 text-paper hover:border-paper hover:bg-paper hover:text-ink sm:inline-flex"
          >
            Back to site
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
