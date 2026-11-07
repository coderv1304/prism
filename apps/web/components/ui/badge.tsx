import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({ children, className }: { children: ReactNode; className?: string; icon?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-l-2 border-rust pl-2.5 font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-current/70",
        className,
      )}
    >
      {children}
    </span>
  );
}
