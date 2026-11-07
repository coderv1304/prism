"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

const links = [
  { href: "/#product", label: "System" },
  { href: "/#how-it-works", label: "Request path" },
  { href: "/architecture", label: "Architecture" },
  { href: "/#access", label: "Access" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/15 bg-paper/95">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Prism home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.16em] text-umber hover:text-rust",
                pathname === link.href && "text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-umber">Live on Azure</span>
          <Link
            href="/console"
            className="border-b border-ink pb-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink hover:border-rust hover:text-rust"
          >
            Open console <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <button
          type="button"
          className="border border-ink/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-ink/15 bg-paper md:hidden">
          <div className="shell flex flex-col py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/10 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/console"
              onClick={() => setOpen(false)}
              className="mt-3 bg-ink px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-paper"
            >
              Open console
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
