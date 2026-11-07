import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { TechStrip } from "@/components/site/tech-strip";
import { Principles } from "@/components/site/principles";
import { Process } from "@/components/site/process";
import { Inspection } from "@/components/site/inspection";
import { Access } from "@/components/site/access";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";

export const metadata: Metadata = {
  title: "Prism | Async job infrastructure",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <SiteNav />
      <main id="main">
        <Hero />
        <TechStrip />
        <Principles />
        <Process />
        <Inspection />
        <Access />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
