import type { JobPayload } from "@prism/contracts";
import { buildDigest, buildInsightReport, buildNormalizedDataset, checksum } from "./workloads";

const payload: JobPayload = { label: "Quarterly pulse", records: 500 };

describe("workloads", () => {
  it("produces a stable checksum for the same input", () => {
    expect(checksum("prism")).toBe(checksum("prism"));
    expect(checksum("prism")).not.toBe(checksum("prisma"));
    expect(checksum("prism")).toMatch(/^[0-9a-f]{8}$/);
  });

  it("builds a deterministic insight report", () => {
    const first = buildInsightReport(payload);
    const second = buildInsightReport(payload);
    const { generatedAt: firstGeneratedAt, ...firstStable } = first;
    const { generatedAt: secondGeneratedAt, ...secondStable } = second;

    expect(firstStable).toEqual(secondStable);
    expect(firstGeneratedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(secondGeneratedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(first.rows).toBe(500);
    expect(first.segments).toBeGreaterThan(0);
    expect(first.totalValue).toBeGreaterThan(0);
    expect(first.averageValue).toBeGreaterThan(0);
    expect(first.checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it("normalizes and de-duplicates dataset noise", () => {
    const result = buildNormalizedDataset(payload);

    expect(result.scanned).toBe(500);
    expect(result.duplicates).toBeGreaterThan(0);
    expect(result.normalized).toBe(result.scanned - result.duplicates);
  });

  it("renders a digest with a bounded number of sections", () => {
    const result = buildDigest(payload);

    expect(result.sections).toBeGreaterThanOrEqual(3);
    expect(result.sections).toBeLessThanOrEqual(8);
    expect(result.words).toBeGreaterThan(0);
    expect(result.readingMinutes).toBeGreaterThan(0);
  });
});
