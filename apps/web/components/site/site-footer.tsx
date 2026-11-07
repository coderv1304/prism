import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "System", href: "/#product" },
      { label: "Request path", href: "/#how-it-works" },
      { label: "Access", href: "/#access" },
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
    title: "Evidence",
    links: [
      { label: "Health endpoint", href: "/api/health" },
      { label: "Queue statistics", href: "/api/v1/queue/stats" },
      { label: "FAQ", href: "/#faq" },
      { label: "Back to top", href: "/#top" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/15 bg-paper-2">
      <div className="shell py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-6 text-[13px] leading-6 text-umber">
              Async job infrastructure for teams that would rather ship features than nurse a queue. Redis carries the
              work; PostgreSQL keeps the record.
            </p>
            <p className="mt-6 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-umber">
              <span className="h-1.5 w-1.5 bg-forest" aria-hidden="true" />
              Deployed in malaysiawest
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-umber">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[12.5px] text-ink/75 hover:text-rust">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-ink/15 pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-umber sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Prism Labs · VEGAH DevOps &amp; Cloud assessment</p>
          <p>Set in Fraunces and Manrope · Next.js · NestJS · PostgreSQL · Redis</p>
        </div>
      </div>
    </footer>
  );
}
