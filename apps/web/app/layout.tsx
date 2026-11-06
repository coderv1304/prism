import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prism — async jobs without the background noise",
    template: "%s · Prism",
  },
  description:
    "Prism queues, retries and streams background jobs — so every request stays fast, every failure is visible, and nothing gets lost between deploys.",
  keywords: ["background jobs", "job queue", "BullMQ", "Redis", "NestJS", "Next.js", "DevOps", "async processing"],
  authors: [{ name: "Prism Engineering" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Prism",
    title: "Prism — async jobs without the background noise",
    description:
      "A production-grade async job platform: Next.js, NestJS, PostgreSQL, Redis and BullMQ — containerized and deployed with confidence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prism — async jobs without the background noise",
    description: "Queue, retry and stream background jobs. Built on Next.js, NestJS, PostgreSQL and Redis.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05040b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-ink text-[#f7f5ff] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-violet focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          closeButton
          toastOptions={{
            style: {
              background: "rgba(12, 9, 24, 0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f7f5ff",
              backdropFilter: "blur(16px)",
            },
          }}
        />
      </body>
    </html>
  );
}
