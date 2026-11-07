import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
});

// Baked at build time: the release workflow passes the deployed URL so
// canonical links, Open Graph tags, robots.txt and sitemap.xml stay absolute.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prism | Async job infrastructure",
    template: "%s | Prism",
  },
  description:
    "Prism queues, retries and records background work, so requests stay fast and every failure remains visible.",
  keywords: ["background jobs", "job queue", "BullMQ", "Redis", "NestJS", "Next.js", "DevOps", "async processing"],
  authors: [{ name: "Prism Engineering" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Prism",
    title: "Prism | Async job infrastructure",
    description:
      "A production-shaped async job platform built with Next.js, NestJS, PostgreSQL, Redis and BullMQ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prism | Async job infrastructure",
    description: "Queue, retry and inspect background work with a real PostgreSQL record.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4edde",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          theme="light"
          position="bottom-right"
          closeButton
          toastOptions={{
            style: {
              background: "#f4edde",
              border: "1px solid rgba(21, 18, 14, 0.2)",
              color: "#15120e",
            },
          }}
        />
      </body>
    </html>
  );
}
