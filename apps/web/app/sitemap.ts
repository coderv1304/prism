import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/console`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/architecture`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
