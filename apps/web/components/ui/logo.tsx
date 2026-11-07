import { cn } from "@/lib/cn";

export function PrismMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 3 37 35H3L20 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M20 3v32" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.5 21h17" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 3l-8.5 18" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 text-current", className)}>
      <PrismMark className="h-6 w-6 text-rust" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[21px] font-medium tracking-[-0.03em]">Prism</span>
        <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] opacity-60">Async infrastructure</span>
      </span>
    </span>
  );
}
