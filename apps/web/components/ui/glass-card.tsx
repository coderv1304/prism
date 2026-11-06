import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  stripe = true,
  interactive = true,
  id,
}: {
  children: ReactNode;
  className?: string;
  stripe?: boolean;
  interactive?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className={cn("glass relative overflow-hidden rounded-3xl", interactive && "card-hover", className)}>
      {stripe ? <div className="stripe absolute inset-x-0 top-0 z-10" aria-hidden="true" /> : null}
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
