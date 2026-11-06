import type { JobPayload } from "@prism/contracts";

/** FNV-1a — small, deterministic and dependency-free. */
export function checksum(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function seedFrom(value: string): number {
  const hex = checksum(value);
  return Number.parseInt(hex, 16);
}

/** Mulberry32 — same input always produces the same dataset. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const SEGMENTS = ["Self-serve", "Enterprise", "Startup", "Agency", "Partner", "Internal"] as const;
const WORDS = [
  "adoption",
  "latency",
  "retention",
  "throughput",
  "activation",
  "reliability",
  "coverage",
  "velocity",
  "quality",
  "uptime",
] as const;

export interface InsightReportResult {
  rows: number;
  totalValue: number;
  averageValue: number;
  p95Value: number;
  segments: number;
  topSegment: string;
  checksum: string;
  generatedAt: string;
  [key: string]: string | number;
}

export function buildInsightReport(payload: JobPayload): InsightReportResult {
  const random = mulberry32(seedFrom(`${payload.label}:${payload.records}`));
  const values: number[] = [];
  const totals = new Map<string, number>();

  for (let index = 0; index < payload.records; index += 1) {
    const segment = SEGMENTS[Math.floor(random() * SEGMENTS.length)] ?? SEGMENTS[0];
    // Skewed distribution: most rows are small, a few are large.
    const value = Math.round(random() * random() * 10_000 * 100) / 100;
    values.push(value);
    totals.set(segment, (totals.get(segment) ?? 0) + value);
  }

  const totalValue = Math.round(values.reduce((sum, value) => sum + value, 0) * 100) / 100;
  const sorted = [...values].sort((left, right) => left - right);
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
  const topSegment = [...totals.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "n/a";

  return {
    rows: payload.records,
    totalValue,
    averageValue: Math.round((totalValue / Math.max(payload.records, 1)) * 100) / 100,
    p95Value: Math.round(p95 * 100) / 100,
    segments: totals.size,
    topSegment,
    checksum: checksum(`${payload.label}|${payload.records}|${totalValue}`),
    generatedAt: new Date().toISOString(),
  };
}

export interface NormalizeResult {
  scanned: number;
  duplicates: number;
  normalized: number;
  checksum: string;
  [key: string]: string | number;
}

export function buildNormalizedDataset(payload: JobPayload): NormalizeResult {
  const random = mulberry32(seedFrom(`normalize:${payload.label}:${payload.records}`));
  const seen = new Set<string>();
  let scanned = 0;

  for (let index = 0; index < payload.records; index += 1) {
    const word = WORDS[Math.floor(random() * WORDS.length)] ?? WORDS[0];
    // Deliberately inject whitespace, casing and duplicate noise.
    const raw = `  ${word}-${index % 250}  `;
    seen.add(raw.trim().toLowerCase());
    scanned += 1;
  }

  const normalized = [...seen].sort();
  return {
    scanned,
    duplicates: scanned - normalized.length,
    normalized: normalized.length,
    checksum: checksum(normalized.join("|")),
  };
}

export interface DigestResult {
  sections: number;
  words: number;
  readingMinutes: number;
  checksum: string;
  [key: string]: string | number;
}

export function buildDigest(payload: JobPayload): DigestResult {
  const random = mulberry32(seedFrom(`digest:${payload.label}:${payload.records}`));
  const sectionCount = Math.max(3, Math.min(8, Math.round(payload.records / 400)));
  let words = 0;
  const sections: string[] = [];

  for (let index = 0; index < sectionCount; index += 1) {
    const word = WORDS[Math.floor(random() * WORDS.length)] ?? WORDS[0];
    const count = 80 + Math.floor(random() * 240);
    words += count;
    sections.push(`${index + 1}. ${word} — ${count} words`);
  }

  return {
    sections: sectionCount,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    checksum: checksum(sections.join("|")),
  };
}
