import { cn } from "@/lib/cn";

export function PrismMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("h-8 w-8", className)} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="prism-mark-gradient" x1="8" y1="54" x2="56" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="0.52" stopColor="#D946EF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="17" fill="#0B0818" />
      <rect x="0.6" y="0.6" width="62.8" height="62.8" rx="16.4" fill="none" stroke="#C4B5FD" strokeOpacity="0.2" />
      <path
        d="M32 11.5L51.5 48.5H12.5L32 11.5Z"
        fill="url(#prism-mark-gradient)"
        fillOpacity="0.14"
        stroke="url(#prism-mark-gradient)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M32 20.5L37.6 31" stroke="#EDE9FE" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M23.5 44.5H41" stroke="url(#prism-mark-gradient)" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M48.5 14.5L49.6 17.6L52.7 18.7L49.6 19.8L48.5 22.9L47.4 19.8L44.3 18.7L47.4 17.6L48.5 14.5Z"
        fill="#F0ABFC"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <PrismMark className="h-8 w-8" />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-[-0.04em] text-white">Prism</span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-mist/70">async infra</span>
      </span>
    </span>
  );
}
