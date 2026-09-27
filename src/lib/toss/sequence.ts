import { resolveCast, tossLine, type CastResult, type CoinFace, type LineValue, type Rng, type TossLine } from "../iching";
import type { Reading } from "../reading";

/** Human-friendly names for each line value, used during the reveal. */
export const LINE_VALUE_LABEL: Record<LineValue, string> = {
  6: "Old Yin",
  7: "Young Yang",
  8: "Young Yin",
  9: "Old Yang",
};

export const COIN_FACE_LABEL: Record<CoinFace, string> = {
  3: "Heads",
  2: "Tails",
};

/** Six tosses, bottom line first, resolved into a full cast. */
export function buildTossSequence(rng: Rng = Math.random): { lines: TossLine[]; cast: CastResult } {
  const lines = Array.from({ length: 6 }, (_, i) => tossLine(i + 1, rng));
  return { lines, cast: resolveCast(lines) };
}

/** Timing (ms) for the toss reveal. Total stays comfortably under ~10s. */
export const TOSS_TIMING = {
  /** Coins spinning in the air. */
  flip: 650,
  /** Coins resting face-up, showing the total. */
  settle: 550,
} as const;

export function totalTossDuration(lines = 6): number {
  return lines * (TOSS_TIMING.flip + TOSS_TIMING.settle);
}

/** One-line summary of a reading for the oracle's `history` context. */
export function summarizeReading(reading: Reading): string {
  const { primary, resulting } = reading.cast;
  const base = `${reading.dateKey}: ${primary.number} ${primary.english}`;
  return resulting ? `${base} → ${resulting.number} ${resulting.english}` : base;
}

/** Up to `limit` summaries of other readings, newest first. */
export function recentHistory(readings: Reading[], excludeId: string, limit = 5): string[] {
  return readings
    .filter((r) => r.id !== excludeId)
    .slice(0, limit)
    .map(summarizeReading);
}
