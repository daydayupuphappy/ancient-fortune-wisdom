import type { Reading } from "../reading";

/** Logical card size (portrait 9:16, Instagram Stories ratio). */
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
/** Export scale for the downloadable PNG (2160×3840). */
export const EXPORT_SCALE = 2;

export const CARD_SITE = "fortune-toss.app";
export const CARD_DISCLAIMER = "For reflection, not prediction.";

export interface CardLine {
  yang: 0 | 1;
  changing: boolean;
}

export interface FortuneCardData {
  date: string;
  score: number;
  label: string;
  hexagramNumber: number;
  chinese: string;
  english: string;
  /** Bottom to top. */
  lines: CardLine[];
  quote: string;
  luckyColor: string;
  luckyColorHex: string;
  luckyTime: string;
}

/** Swatches for every lucky color produced by `deriveDailyEnergy`. */
export const LUCKY_COLOR_HEX: Record<string, string> = {
  Amber: "#d99a3d",
  Jade: "#6f9a86",
  Ink: "#1c1a17",
  Ivory: "#f4ecd8",
  Vermilion: "#b4472f",
  Indigo: "#3f4a7a",
  Gold: "#c9a24a",
  Moss: "#7a8450",
  Rose: "#c98b8b",
  Slate: "#6b7280",
};

/** "September 27" */
export function formatCardDate(date: Date, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(date);
}

/** First sentence of a passage, trimmed. Returns the whole text if no terminator is found. */
export function firstSentence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^.+?[.!?。！？](?=\s|$)/);
  return (match ? match[0] : trimmed).trim();
}

/** Quote for the card: first sentence of the hexagram interpretation, else the reflection question. */
export function pickQuote(interpretation: string | undefined, reflection: string): string {
  const fromInterpretation = interpretation ? firstSentence(interpretation) : "";
  return fromInterpretation || reflection.trim();
}

const WINDOW_RE = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i;

/** "4:00 PM – 6:00 PM" → "4–6 PM"; "10:00 AM – 12:00 PM" → "10 AM–12 PM". */
export function formatLuckyTime(window: string): string {
  const m = window.trim().match(WINDOW_RE);
  if (!m) return window;
  const [, h1, m1, p1, h2, m2, p2] = m;
  const t = (h: string, min: string | undefined) => (min && min !== "00" ? `${Number(h)}:${min}` : `${Number(h)}`);
  const start = t(h1, m1);
  const end = t(h2, m2);
  const startPeriod = p1.toUpperCase();
  const endPeriod = p2.toUpperCase();
  return startPeriod === endPeriod ? `${start}–${end} ${endPeriod}` : `${start} ${startPeriod}–${end} ${endPeriod}`;
}

export function buildCardData(reading: Reading): FortuneCardData {
  const { cast, energy } = reading;
  const hexagram = cast.primary;
  return {
    date: formatCardDate(new Date(reading.createdAt)),
    score: energy.score,
    label: energy.label,
    hexagramNumber: hexagram.number,
    chinese: hexagram.chinese,
    english: hexagram.english,
    lines: cast.lines.map((l) => ({ yang: l.yang, changing: l.changing })),
    quote: pickQuote(hexagram.interpretation, energy.reflection),
    luckyColor: energy.luckyColor,
    luckyColorHex: LUCKY_COLOR_HEX[energy.luckyColor] ?? "#c9a24a",
    luckyTime: formatLuckyTime(energy.luckyWindow),
  };
}

/** "Hexagram 46 · 升 Pushing Upward · Momentum Day 82/100 — fortune-toss.app" */
export function buildShareText(data: FortuneCardData): string {
  return `Hexagram ${data.hexagramNumber} · ${data.chinese} ${data.english} · ${data.label} ${data.score}/100 — ${CARD_SITE}`;
}

export function shareFileName(data: FortuneCardData, dateKey: string): string {
  return `fortune-toss-hexagram-${data.hexagramNumber}-${dateKey}.png`;
}

/**
 * Greedy word wrap using a caller-supplied width measure (e.g. canvas measureText).
 * Lines beyond `maxLines` are collapsed into the last line with an ellipsis.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (s: string) => number,
  maxLines = Infinity,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.includes(" ") && measure(`${last}…`) > maxWidth) {
    last = last.slice(0, last.lastIndexOf(" "));
  }
  kept[maxLines - 1] = `${last.replace(/[\s.,;:!?]+$/, "")}…`;
  return kept;
}

/** Largest font size ≤ `max` (and ≥ `min`) at which `measure(size)` fits in `maxWidth`. */
export function fitFontSize(maxWidth: number, max: number, min: number, measure: (size: number) => number): number {
  let size = max;
  while (size > min && measure(size) > maxWidth) size -= 2;
  return Math.max(size, min);
}
