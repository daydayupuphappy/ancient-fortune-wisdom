import { dateKey, type DayTheme, type TrigramKey } from "./iching";
import type { Reading, StoredReading } from "./reading";
import { computeStreak } from "./storage";

export const ALL_THEMES: readonly DayTheme[] = [
  "Growth",
  "Connection",
  "Action",
  "Reflection",
  "High Energy",
  "Creativity",
  "Rest",
];

export const ALL_TRIGRAMS: readonly TrigramKey[] = [
  "heaven",
  "earth",
  "thunder",
  "wind",
  "water",
  "fire",
  "mountain",
  "lake",
];

export interface ThemeCount {
  theme: DayTheme;
  count: number;
}

export interface WeeklySummary {
  /** Distinct days with a reading in the window. */
  days: number;
  /** Non-zero theme counts, most frequent first (one per day — the day's first reading). */
  themes: ThemeCount[];
  /** Highest count, useful for scaling bars. */
  max: number;
}

/** Local YYYY-MM-DD keys for the last `n` days, ending at `now`. */
export function lastNDayKeys(now: Date, n: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(dateKey(d));
  }
  return keys;
}

/**
 * Energy theme counts over the last seven days (including today).
 * A day counts once, using its most recent reading.
 */
export function weeklySummary(readings: Reading[], now = new Date()): WeeklySummary {
  const window = new Set(lastNDayKeys(now, 7));
  const byDay = new Map<string, Reading>();
  for (const r of readings) {
    if (!window.has(r.dateKey)) continue;
    const existing = byDay.get(r.dateKey);
    if (!existing || r.createdAt > existing.createdAt) byDay.set(r.dateKey, r);
  }
  const counts = new Map<DayTheme, number>();
  for (const r of byDay.values()) counts.set(r.energy.theme, (counts.get(r.energy.theme) ?? 0) + 1);
  const themes = ALL_THEMES.filter((t) => counts.has(t))
    .map((theme) => ({ theme, count: counts.get(theme)! }))
    .sort((a, b) => b.count - a.count);
  return { days: byDay.size, themes, max: themes[0]?.count ?? 0 };
}

export type BadgeId =
  | "first-toss"
  | "streak-7"
  | "journey-30"
  | "ten-hexagrams"
  | "eight-trigrams";

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  /** Chinese character used as the badge glyph. */
  glyph: string;
  earned: boolean;
  /** 0–1 progress toward the badge. */
  progress: number;
}

export function distinctHexagrams(readings: Reading[]): number {
  return new Set(readings.map((r) => r.cast.primary.number)).size;
}

export function distinctTrigrams(readings: Reading[]): Set<TrigramKey> {
  const set = new Set<TrigramKey>();
  for (const r of readings) {
    set.add(r.cast.primary.upper.key);
    set.add(r.cast.primary.lower.key);
  }
  return set;
}

/** Longest run of consecutive days with at least one reading. */
export function longestStreak(readings: StoredReading[]): number {
  const days = [...new Set(readings.map((r) => r.dateKey))].sort();
  let best = 0;
  let run = 0;
  let prev: Date | undefined;
  for (const key of days) {
    const d = new Date(`${key}T00:00:00`);
    if (prev && d.getTime() - prev.getTime() === 86_400_000) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function computeBadges(readings: Reading[], now = new Date()): Badge[] {
  const best = Math.max(longestStreak(readings), computeStreak(readings, now));
  const hexes = distinctHexagrams(readings);
  const trigrams = distinctTrigrams(readings).size;
  const ratio = (value: number, goal: number) => Math.min(1, value / goal);
  return [
    {
      id: "first-toss",
      title: "First Toss",
      description: "Your first reading.",
      glyph: "始",
      earned: readings.length > 0,
      progress: ratio(readings.length, 1),
    },
    {
      id: "streak-7",
      title: "7-Day Streak",
      description: "Seven days of reflection in a row.",
      glyph: "七",
      earned: best >= 7,
      progress: ratio(best, 7),
    },
    {
      id: "journey-30",
      title: "30-Day Journey",
      description: "Thirty consecutive days.",
      glyph: "旅",
      earned: best >= 30,
      progress: ratio(best, 30),
    },
    {
      id: "ten-hexagrams",
      title: "Explored 10 Hexagrams",
      description: "Ten distinct hexagrams cast.",
      glyph: "卦",
      earned: hexes >= 10,
      progress: ratio(hexes, 10),
    },
    {
      id: "eight-trigrams",
      title: "All Eight Trigrams",
      description: "Every trigram has appeared in your readings.",
      glyph: "八",
      earned: trigrams >= 8,
      progress: ratio(trigrams, 8),
    },
  ];
}

export interface MonthGroup {
  /** e.g. "2026-09" */
  key: string;
  label: string;
  readings: Reading[];
}

/** Group readings (already sorted newest first) by calendar month. */
export function groupByMonth(readings: Reading[], now = new Date()): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const r of readings) {
    const key = r.dateKey.slice(0, 7);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      const d = new Date(`${r.dateKey}T00:00:00`);
      const sameYear = d.getFullYear() === now.getFullYear();
      const label = d.toLocaleDateString("en-US", sameYear ? { month: "long" } : { month: "long", year: "numeric" });
      g = { key, label, readings: [] };
      groups.push(g);
    }
    g.readings.push(r);
  }
  return groups;
}

export function formatShortDate(dateKeyStr: string): string {
  return new Date(`${dateKeyStr}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
