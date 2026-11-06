import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
  icon = true,
}: {
  children: ReactNode;
  className?: string;
  icon?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/[0.09] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-lilac",
        className,
      )}
    >
      {icon ? <Sparkles className="h-3.5 w-3.5 text-fuchsia" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
