import { describe, expect, it } from "vitest";
import {
  HEXAGRAMS,
  castFromValues,
  castHexagram,
  deriveDailyEnergy,
  getHexagram,
  hexagramFromLines,
  lineFromCoins,
  seededRng,
} from "..";

describe("hexagram database", () => {
  it("has 64 unique hexagrams with unique line patterns", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    expect(new Set(HEXAGRAMS.map((h) => h.binary)).size).toBe(64);
    expect(new Set(HEXAGRAMS.map((h) => h.chinese)).size).toBe(64);
    HEXAGRAMS.forEach((h, i) => expect(h.number).toBe(i + 1));
  });

  it("matches well-known patterns", () => {
    expect(getHexagram(1).binary).toBe("111111");
    expect(getHexagram(2).binary).toBe("000000");
    expect(getHexagram(46).english).toBe("Pushing Upward");
    expect(getHexagram(46).lower.english).toBe("Wind");
    expect(getHexagram(46).upper.english).toBe("Earth");
    expect(getHexagram(63).binary).toBe("101010");
    expect(getHexagram(64).binary).toBe("010101");
  });
});

describe("coin toss", () => {
  it("maps coin totals to line kinds", () => {
    expect(lineFromCoins(1, [2, 2, 2])).toMatchObject({ value: 6, kind: "old-yin", yang: 0, changing: true });
    expect(lineFromCoins(1, [2, 2, 3])).toMatchObject({ value: 7, kind: "young-yang", yang: 1, changing: false });
    expect(lineFromCoins(1, [2, 3, 3])).toMatchObject({ value: 8, kind: "young-yin", yang: 0, changing: false });
    expect(lineFromCoins(1, [3, 3, 3])).toMatchObject({ value: 9, kind: "old-yang", yang: 1, changing: true });
  });

  it("builds bottom-to-top and computes the resulting hexagram", () => {
    // Bottom line old yang (9) -> changes to yin; rest young yang.
    const cast = castFromValues([9, 7, 7, 7, 7, 7]);
    expect(cast.primary.number).toBe(1);
    expect(cast.changingLines).toEqual([1]);
    expect(cast.resulting?.number).toBe(44); // 姤 Coming to Meet: wind below heaven
  });

  it("has no resulting hexagram without changing lines", () => {
    const cast = castFromValues([7, 8, 7, 8, 7, 8]);
    expect(cast.resulting).toBeUndefined();
    expect(cast.primary).toBe(hexagramFromLines([1, 0, 1, 0, 1, 0]));
  });

  it("is reproducible with a seeded rng", () => {
    const a = castHexagram(seededRng(42));
    const b = castHexagram(seededRng(42));
    expect(a.lines.map((l) => l.value)).toEqual(b.lines.map((l) => l.value));
    expect(a.lines).toHaveLength(6);
  });
});

describe("daily energy", () => {
  it("is deterministic and bounded", () => {
    const cast = castFromValues([7, 8, 9, 6, 7, 8]);
    const date = new Date("2026-09-27T10:00:00");
    const a = deriveDailyEnergy(cast, date);
    const b = deriveDailyEnergy(cast, date);
    expect(a).toEqual(b);
    expect(a.score).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeLessThanOrEqual(100);
    expect(a.favors.length).toBeGreaterThan(0);
    expect(a.reflection).toMatch(/\?$/);
  });
});
