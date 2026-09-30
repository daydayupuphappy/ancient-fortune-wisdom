import { describe, expect, it } from "vitest";
import { castFromValues, castHexagram, seededRng, type LineValue } from "../iching";
import { hydrateReading, newStoredReading, type Reading } from "../reading";
import {
  computeBadges,
  distinctHexagrams,
  distinctTrigrams,
  groupByMonth,
  lastNDayKeys,
  longestStreak,
  weeklySummary,
} from "../gamification";

const NOW = new Date(2026, 8, 27, 12, 0, 0); // Sep 27 2026, local noon

function daysAgo(n: number, base = NOW): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - n);
  return d;
}

function seeded(days: number[], seedOffset = 0): Reading[] {
  return days.map((n, i) => hydrateReading(newStoredReading(castHexagram(seededRng(i + seedOffset)), undefined, daysAgo(n))));
}

function withLines(values: LineValue[], n: number): Reading {
  return hydrateReading(newStoredReading(castFromValues(values), undefined, daysAgo(n)));
}

describe("lastNDayKeys", () => {
  it("returns n consecutive local day keys ending today", () => {
    const keys = lastNDayKeys(NOW, 3);
    expect(keys).toEqual(["2026-09-27", "2026-09-26", "2026-09-25"]);
  });
});

describe("weeklySummary", () => {
  it("counts one theme per day over the last 7 days", () => {
    const readings = seeded([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const summary = weeklySummary(readings, NOW);
    expect(summary.days).toBe(7);
    expect(summary.themes.reduce((s, t) => s + t.count, 0)).toBe(7);
    expect(summary.max).toBe(summary.themes[0].count);
    for (let i = 1; i < summary.themes.length; i++) {
      expect(summary.themes[i - 1].count).toBeGreaterThanOrEqual(summary.themes[i].count);
    }
  });

  it("is empty with no readings", () => {
    expect(weeklySummary([], NOW)).toEqual({ days: 0, themes: [], max: 0 });
  });

  it("uses the most recent reading of a day", () => {
    const morning = withLines([7, 7, 7, 7, 7, 7], 0); // Hexagram 1 -> High Energy
    const later = hydrateReading({
      ...newStoredReading(castFromValues([8, 8, 8, 8, 8, 8]), undefined, new Date(NOW.getTime() + 1000)),
    }); // Hexagram 2 -> Rest
    const summary = weeklySummary([morning, later], NOW);
    expect(summary.days).toBe(1);
    expect(summary.themes).toEqual([{ theme: "Rest", count: 1 }]);
  });
});

describe("longestStreak", () => {
  it("finds the longest run of consecutive days", () => {
    const readings = seeded([0, 1, 2, 5, 6, 7, 8, 9]);
    expect(longestStreak(readings)).toBe(5);
  });
  it("is 0 for no readings", () => {
    expect(longestStreak([])).toBe(0);
  });
});

describe("distinct counts", () => {
  it("counts distinct primary hexagrams and trigrams", () => {
    const a = withLines([7, 7, 7, 7, 7, 7], 0); // heaven/heaven
    const b = withLines([8, 8, 8, 8, 8, 8], 1); // earth/earth
    const c = withLines([7, 7, 7, 7, 7, 7], 2); // duplicate of a
    expect(distinctHexagrams([a, b, c])).toBe(2);
    expect([...distinctTrigrams([a, b, c])].sort()).toEqual(["earth", "heaven"]);
  });
});

describe("computeBadges", () => {
  it("locks everything without readings", () => {
    const badges = computeBadges([], NOW);
    expect(badges).toHaveLength(5);
    expect(badges.every((b) => !b.earned && b.progress === 0)).toBe(true);
  });

  it("awards First Toss and 7-Day Streak for a week of readings", () => {
    const badges = computeBadges(seeded([0, 1, 2, 3, 4, 5, 6]), NOW);
    const byId = Object.fromEntries(badges.map((b) => [b.id, b]));
    expect(byId["first-toss"].earned).toBe(true);
    expect(byId["streak-7"].earned).toBe(true);
    expect(byId["journey-30"].earned).toBe(false);
    expect(byId["journey-30"].progress).toBeCloseTo(7 / 30);
  });

  it("awards the 30-Day Journey for thirty consecutive days", () => {
    const badges = computeBadges(seeded(Array.from({ length: 30 }, (_, i) => i)), NOW);
    expect(badges.find((b) => b.id === "journey-30")?.earned).toBe(true);
  });

  it("awards hexagram and trigram exploration badges", () => {
    const yang: LineValue = 7;
    const yin: LineValue = 8;
    // Build hexagrams by combining trigram line patterns for all 8 x 8 = 64.
    const patterns: LineValue[][] = [];
    for (let i = 0; i < 64; i++) {
      patterns.push(Array.from({ length: 6 }, (_, bit) => ((i >> bit) & 1 ? yang : yin)));
    }
    const readings = patterns.slice(0, 12).map((p, i) => withLines(p, i));
    const byId = Object.fromEntries(computeBadges(readings, NOW).map((b) => [b.id, b]));
    expect(byId["ten-hexagrams"].earned).toBe(true);
    expect(byId["eight-trigrams"].earned).toBe(true); // 0..11 covers all lower trigrams 0..7
  });
});

describe("groupByMonth", () => {
  it("groups newest-first readings by month with labels", () => {
    const readings = seeded([0, 1, 40]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const groups = groupByMonth(readings, NOW);
    expect(groups.map((g) => g.key)).toEqual(["2026-09", "2026-08"]);
    expect(groups[0].label).toBe("September");
    expect(groups[0].readings).toHaveLength(2);
    expect(groups[1].readings).toHaveLength(1);
  });
});
