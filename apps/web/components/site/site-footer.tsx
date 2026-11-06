import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#product" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Live console", href: "/console" },
    ],
  },
  {
    title: "Engineering",
    links: [
      { label: "Architecture", href: "/architecture" },
      { label: "API reference", href: "/architecture#api" },
      { label: "Reliability", href: "/architecture#reliability" },
      { label: "Deployment", href: "/architecture#deployment" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Health endpoint", href: "/api/health" },
      { label: "Queue stats", href: "/api/v1/queue/stats" },
      { label: "Back to top", href: "/#top" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#04030a]">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-5 text-sm leading-relaxed text-mist">
              Async job infrastructure for teams that would rather ship features than babysit queues. Queue it, retry
              it, watch it finish — with PostgreSQL holding the receipts.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[12px] text-mist/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Demo environment · all services monitored
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist/60">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[13px] text-mist transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-6 text-[11px] text-mist/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Prism Labs. A demo build for the VEGAH DevOps &amp; Cloud assessment.</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
            Next.js · NestJS · PostgreSQL · Redis · BullMQ
          </p>
        </div>
      </div>
    </footer>
  );
}
