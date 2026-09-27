import {
  castFromValues,
  dateKey,
  deriveDailyEnergy,
  type CastResult,
  type DailyEnergy,
  type LineValue,
} from "./iching";

/**
 * A stored reading. Only raw line values are persisted; everything else is
 * re-derived deterministically via `hydrateReading`.
 */
export interface StoredReading {
  id: string;
  /** ISO timestamp of the toss. */
  createdAt: string;
  /** YYYY-MM-DD (local) — one "daily" reading per day is the streak unit. */
  dateKey: string;
  /** Six line values (6/7/8/9), bottom to top. */
  lineValues: LineValue[];
  /** Optional user question asked before / after the toss. */
  question?: string;
  /** Cached AI interpretation, if fetched. */
  interpretation?: string;
  /** Oracle Q&A thread for this reading. */
  oracle?: { question: string; answer: string; askedAt: string }[];
}

export interface Reading extends StoredReading {
  cast: CastResult;
  energy: DailyEnergy;
}

export function hydrateReading(stored: StoredReading): Reading {
  const cast = castFromValues(stored.lineValues);
  const energy = deriveDailyEnergy(cast, new Date(stored.createdAt));
  return { ...stored, cast, energy };
}

export function newStoredReading(cast: CastResult, question?: string, now = new Date()): StoredReading {
  return {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.toISOString(),
    dateKey: dateKey(now),
    lineValues: cast.lines.map((l) => l.value),
    question,
  };
}
