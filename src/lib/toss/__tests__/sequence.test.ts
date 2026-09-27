import { describe, expect, it } from "vitest";
import { castFromValues, seededRng } from "../../iching";
import { hydrateReading, type StoredReading } from "../../reading";
import { buildTossSequence, recentHistory, summarizeReading, TOSS_TIMING, totalTossDuration } from "../sequence";

function stored(id: string, dateKey: string, lineValues: number[]): StoredReading {
  return { id, createdAt: `${dateKey}T09:00:00.000Z`, dateKey, lineValues: lineValues as StoredReading["lineValues"] };
}

describe("buildTossSequence", () => {
  it("produces six lines bottom-to-top and a cast consistent with them", () => {
    const { lines, cast } = buildTossSequence(seededRng(42));
    expect(lines).toHaveLength(6);
    expect(lines.map((l) => l.position)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(cast.lines).toBe(lines);
    expect(cast.primary.lines).toEqual(lines.map((l) => l.yang));
    lines.forEach((l) => expect(l.coins[0] + l.coins[1] + l.coins[2]).toBe(l.value));
  });

  it("is deterministic for a seeded rng", () => {
    const a = buildTossSequence(seededRng(7)).cast.lines.map((l) => l.value);
    const b = buildTossSequence(seededRng(7)).cast.lines.map((l) => l.value);
    expect(a).toEqual(b);
  });
});

describe("timing", () => {
  it("keeps the whole reveal under ten seconds", () => {
    expect(totalTossDuration()).toBe(6 * (TOSS_TIMING.flip + TOSS_TIMING.settle));
    expect(totalTossDuration()).toBeLessThan(10_000);
  });
});

describe("history summaries", () => {
  it("summarizes primary and resulting hexagrams", () => {
    const r = hydrateReading(stored("a", "2026-01-02", [7, 7, 7, 7, 7, 7]));
    expect(summarizeReading(r)).toBe("2026-01-02: 1 The Creative");
    const c = hydrateReading(stored("b", "2026-01-03", [9, 7, 7, 7, 7, 7]));
    expect(castFromValues(c.lineValues).resulting?.number).toBe(44);
    expect(summarizeReading(c)).toBe("2026-01-03: 1 The Creative → 44 Coming to Meet");
  });

  it("excludes the current reading and caps at five", () => {
    const readings = Array.from({ length: 8 }, (_, i) =>
      hydrateReading(stored(`r${i}`, `2026-01-0${i + 1}`, [8, 8, 8, 8, 8, 8])),
    );
    const history = recentHistory(readings, "r0");
    expect(history).toHaveLength(5);
    expect(history.some((h) => h.startsWith("2026-01-01"))).toBe(false);
  });
});
