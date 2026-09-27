import { describe, expect, it } from "vitest";
import { castFromValues } from "../../iching";
import { hydrateReading, newStoredReading } from "../../reading";
import {
  appendExchange,
  buildHistory,
  MAX_QUESTION_LENGTH,
  normalizeQuestion,
  summarizeReading,
  toStoredReading,
} from "../history";

const mk = (values: (6 | 7 | 8 | 9)[], iso: string, question?: string) => {
  const stored = newStoredReading(castFromValues(values), question, new Date(iso));
  return hydrateReading(stored);
};

describe("summarizeReading", () => {
  it("includes number, english, chinese and resulting hexagram", () => {
    const r = mk([9, 7, 7, 7, 7, 7], "2026-01-05T10:00:00Z");
    const s = summarizeReading(r);
    expect(s).toContain("1 The Creative (乾)");
    expect(s).toContain("→ 44");
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}:/);
  });

  it("omits the arrow when nothing changes and quotes a truncated question", () => {
    const r = mk([7, 7, 7, 7, 7, 7], "2026-01-05T10:00:00Z", "x".repeat(80));
    const s = summarizeReading(r);
    expect(s).not.toContain("→");
    expect(s).toContain(`asked "${"x".repeat(59)}…"`);
  });
});

describe("buildHistory", () => {
  it("excludes the current reading, sorts newest first and caps at 5", () => {
    const readings = Array.from({ length: 8 }, (_, i) =>
      mk([7, 7, 7, 7, 7, 8], `2026-01-0${i + 1}T10:00:00Z`),
    );
    const current = readings[7];
    const history = buildHistory(readings, current.id);
    expect(history).toHaveLength(5);
    expect(history[0]).toContain("2026-01-07");
    expect(history[4]).toContain("2026-01-03");
    expect(history.some((h) => h.startsWith(current.dateKey))).toBe(false);
  });

  it("returns an empty array when only the current reading exists", () => {
    const r = mk([8, 8, 8, 8, 8, 8], "2026-01-05T10:00:00Z");
    expect(buildHistory([r], r.id)).toEqual([]);
  });
});

describe("appendExchange", () => {
  it("appends without mutating and creates the thread when missing", () => {
    const stored = newStoredReading(castFromValues([7, 8, 7, 8, 7, 8]));
    const ex = { question: "q", answer: "a", askedAt: "2026-01-05T10:00:00Z" };
    const next = appendExchange(stored, ex);
    expect(stored.oracle).toBeUndefined();
    expect(next.oracle).toEqual([ex]);
    const again = appendExchange(next, { ...ex, question: "q2" });
    expect(again.oracle).toHaveLength(2);
    expect(again.oracle?.[1].question).toBe("q2");
  });
});

describe("normalizeQuestion", () => {
  it("collapses whitespace and caps length", () => {
    expect(normalizeQuestion("  how   should\n I  act? ")).toBe("how should I act?");
    expect(normalizeQuestion("a".repeat(600))).toHaveLength(MAX_QUESTION_LENGTH);
    expect(normalizeQuestion("   ")).toBe("");
  });
});

describe("toStoredReading", () => {
  it("drops derived cast/energy fields", () => {
    const r = mk([7, 8, 7, 8, 7, 8], "2026-01-05T10:00:00Z", "why?");
    const stored = toStoredReading(r);
    expect(stored).toEqual({
      id: r.id,
      createdAt: r.createdAt,
      dateKey: r.dateKey,
      lineValues: r.lineValues,
      question: "why?",
      interpretation: undefined,
      oracle: undefined,
    });
    expect("cast" in stored).toBe(false);
  });
});
