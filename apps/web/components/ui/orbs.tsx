import { cn } from "@/lib/cn";

const palette = {
  violet: "bg-[#7c3aed]",
  fuchsia: "bg-[#d946ef]",
  cyan: "bg-[#22d3ee]",
  amber: "bg-[#f5b544]",
} as const;

export function Orb({ tone = "violet", className }: { tone?: keyof typeof palette; className?: string }) {
  return <div aria-hidden="true" className={cn("orb", palette[tone], className)} />;
}

/**
 * Positions a handful of soft orbs behind a section. Kept as one component so
 * every page uses the same restrained amount of glow.
 */
export function OrbField({ variant = "hero" }: { variant?: "hero" | "cta" | "console" }) {
  if (variant === "console") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Orb tone="violet" className="-left-40 top-0 h-[420px] w-[420px] opacity-30" />
        <Orb tone="fuchsia" className="-right-32 top-24 h-[360px] w-[360px] opacity-20" />
      </div>
    );
  }

  if (variant === "cta") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Orb tone="violet" className="left-[8%] top-[-20%] h-[440px] w-[440px] opacity-60" />
        <Orb tone="fuchsia" className="right-[6%] top-[10%] h-[380px] w-[380px] opacity-45" />
        <Orb tone="cyan" className="bottom-[-30%] left-[42%] h-[320px] w-[320px] opacity-30" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Orb tone="violet" className="-left-32 top-[-10%] h-[560px] w-[560px] animate-drift opacity-55" />
      <Orb
        tone="fuchsia"
        className="right-[-10%] top-[6%] h-[460px] w-[460px] animate-drift opacity-40 [animation-delay:-6s]"
      />
      <Orb tone="cyan" className="bottom-[-24%] left-[38%] h-[420px] w-[420px] opacity-25" />
    </div>
  );
}
