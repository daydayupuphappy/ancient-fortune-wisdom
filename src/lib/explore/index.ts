import {
  HEXAGRAMS,
  TRIGRAMS,
  hexagramFromLines,
  type Hexagram,
  type TrigramKey,
} from "../iching";

export const TRIGRAM_KEYS: TrigramKey[] = [
  "heaven",
  "earth",
  "thunder",
  "wind",
  "water",
  "fire",
  "mountain",
  "lake",
];

export function isTrigramKey(value: string | null | undefined): value is TrigramKey {
  return !!value && (TRIGRAM_KEYS as string[]).includes(value);
}

/** Strip diacritics so "qian" matches "Qián". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export interface HexagramFilter {
  query?: string;
  upper?: TrigramKey | null;
  lower?: TrigramKey | null;
}

export function matchesQuery(h: Hexagram, rawQuery: string): boolean {
  const q = normalize(rawQuery);
  if (!q) return true;
  if (/^\d+$/.test(q)) return h.number === Number(q);
  if (h.chinese.includes(rawQuery.trim())) return true;
  const haystack = [
    h.pinyin,
    h.english,
    h.theme,
    ...h.keywords,
    h.upper.english,
    h.lower.english,
    h.upper.pinyin,
    h.lower.pinyin,
  ]
    .map(normalize)
    .join(" | ");
  return haystack.includes(q);
}

export function filterHexagrams(filter: HexagramFilter, source: Hexagram[] = HEXAGRAMS): Hexagram[] {
  return source.filter((h) => {
    if (filter.upper && h.upper.key !== filter.upper) return false;
    if (filter.lower && h.lower.key !== filter.lower) return false;
    return matchesQuery(h, filter.query ?? "");
  });
}

/** Hexagram with every line flipped (yin <-> yang). */
export function oppositeHexagram(h: Hexagram): Hexagram {
  return hexagramFromLines(h.lines.map((l) => (l ? 0 : 1)));
}

/** Hexagram with the upper and lower trigrams swapped. Returns null when identical. */
export function swappedHexagram(h: Hexagram): Hexagram | null {
  if (h.upper.key === h.lower.key) return null;
  return hexagramFromLines([...TRIGRAMS[h.upper.key].lines, ...TRIGRAMS[h.lower.key].lines]);
}

/** Hexagram formed by lower trigram `lower` beneath upper trigram `upper`. */
export function hexagramFor(upper: TrigramKey, lower: TrigramKey): Hexagram {
  return hexagramFromLines([...TRIGRAMS[lower].lines, ...TRIGRAMS[upper].lines]);
}

export function prevHexagramNumber(n: number): number {
  return n === 1 ? 64 : n - 1;
}

export function nextHexagramNumber(n: number): number {
  return n === 64 ? 1 : n + 1;
}
