import type { Reading, StoredReading } from "../reading";

export interface OracleExchange {
  question: string;
  answer: string;
  askedAt: string;
}

export const MAX_HISTORY = 5;
export const MAX_QUESTION_LENGTH = 500;

/** One-line summary of a reading for the interpreter's "recent readings" context. */
export function summarizeReading(reading: Reading): string {
  const { primary, resulting } = reading.cast;
  const base = `${reading.dateKey}: ${primary.number} ${primary.english} (${primary.chinese})`;
  const shift = resulting ? ` → ${resulting.number} ${resulting.english}` : "";
  const q = reading.question?.trim() ? ` — asked "${truncate(reading.question.trim(), 60)}"` : "";
  return `${base}${shift}${q}`;
}

/**
 * Builds up to `limit` history strings from other readings (excluding the one
 * being consulted), newest first.
 */
export function buildHistory(readings: Reading[], currentId: string, limit = MAX_HISTORY): string[] {
  return [...readings]
    .filter((r) => r.id !== currentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(summarizeReading);
}

/** Returns a new StoredReading with the exchange appended to its oracle thread. */
export function appendExchange(reading: StoredReading, exchange: OracleExchange): StoredReading {
  return { ...reading, oracle: [...(reading.oracle ?? []), exchange] };
}

/** Strips derived fields so only the persisted shape is written back to storage. */
export function toStoredReading(reading: Reading): StoredReading {
  const { id, createdAt, dateKey, lineValues, question, interpretation, oracle } = reading;
  return { id, createdAt, dateKey, lineValues, question, interpretation, oracle };
}

/** Normalizes a user question: trims, collapses whitespace, caps length. */
export function normalizeQuestion(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_QUESTION_LENGTH);
}

export const SUGGESTED_QUESTIONS = [
  "How should I approach an important conversation?",
  "What should I focus on in my career right now?",
  "I'm considering starting a company. What should I reflect on?",
  "What energy should I bring to my interview?",
] as const;

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
