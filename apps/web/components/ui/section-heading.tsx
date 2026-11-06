import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start", className)}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-lilac/80">
          <span className="h-1 w-1 rounded-full bg-fuchsia shadow-[0_0_10px_2px_rgba(217,70,239,0.6)]" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="max-w-3xl text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.06] text-white">{title}</h2>
      {description ? (
        <p className={cn("max-w-2xl text-[15px] leading-relaxed text-mist", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
