import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { TechStrip } from "@/components/site/tech-strip";
import { Bento } from "@/components/site/bento";
import { FeatureRow } from "@/components/site/feature-row";
import { HowItWorks } from "@/components/site/how-it-works";
import { Testimonials } from "@/components/site/testimonials";
import { Pricing } from "@/components/site/pricing";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";

export const metadata: Metadata = {
  title: "Prism — async jobs without the background noise",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <SiteNav />
      <main id="main">
        <Hero />
        <TechStrip />
        <Bento />
        <FeatureRow />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
