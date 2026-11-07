import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  interactive = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className={cn("glass relative", interactive && "card-hover", className)}>
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
