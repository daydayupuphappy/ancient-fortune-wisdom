import { hexagramFromLines, type Hexagram } from "./hexagrams";

/** Heads = 3, Tails = 2. */
export type CoinFace = 2 | 3;
export type LineValue = 6 | 7 | 8 | 9;
export type LineKind = "old-yin" | "young-yang" | "young-yin" | "old-yang";

export interface TossLine {
  /** 1-based position, 1 = bottom, 6 = top. */
  position: number;
  coins: [CoinFace, CoinFace, CoinFace];
  value: LineValue;
  kind: LineKind;
  /** 1 = yang, 0 = yin (before any change). */
  yang: 0 | 1;
  changing: boolean;
}

export interface CastResult {
  /** Bottom to top. */
  lines: TossLine[];
  primary: Hexagram;
  /** Present only when at least one line is changing. */
  resulting?: Hexagram;
  /** 1-based positions of changing lines, bottom to top. */
  changingLines: number[];
}

export const LINE_KIND: Record<LineValue, LineKind> = {
  6: "old-yin",
  7: "young-yang",
  8: "young-yin",
  9: "old-yang",
};

export const LINE_GLYPH: Record<LineKind, string> = {
  "young-yang": "────────────",
  "young-yin": "───── ─────",
  "old-yang": "──────────── ○",
  "old-yin": "───── ───── ×",
};

export type Rng = () => number;

export function tossCoin(rng: Rng = Math.random): CoinFace {
  return rng() < 0.5 ? 2 : 3;
}

export function tossLine(position: number, rng: Rng = Math.random): TossLine {
  const coins: [CoinFace, CoinFace, CoinFace] = [tossCoin(rng), tossCoin(rng), tossCoin(rng)];
  return lineFromCoins(position, coins);
}

export function lineFromCoins(position: number, coins: [CoinFace, CoinFace, CoinFace]): TossLine {
  const value = (coins[0] + coins[1] + coins[2]) as LineValue;
  const kind = LINE_KIND[value];
  const yang: 0 | 1 = value === 7 || value === 9 ? 1 : 0;
  return { position, coins, value, kind, yang, changing: value === 6 || value === 9 };
}

/** Perform six tosses; first toss is the bottom line. */
export function castHexagram(rng: Rng = Math.random): CastResult {
  const lines = Array.from({ length: 6 }, (_, i) => tossLine(i + 1, rng));
  return resolveCast(lines);
}

/** Rebuild a cast from six line values (6/7/8/9), bottom to top. */
export function castFromValues(values: readonly LineValue[]): CastResult {
  if (values.length !== 6) throw new Error("A cast needs exactly six line values");
  const lines = values.map((value, i) => {
    const kind = LINE_KIND[value];
    const yang: 0 | 1 = value === 7 || value === 9 ? 1 : 0;
    const coins: [CoinFace, CoinFace, CoinFace] =
      value === 6 ? [2, 2, 2] : value === 7 ? [2, 2, 3] : value === 8 ? [2, 3, 3] : [3, 3, 3];
    return { position: i + 1, coins, value, kind, yang, changing: value === 6 || value === 9 };
  });
  return resolveCast(lines);
}

export function resolveCast(lines: TossLine[]): CastResult {
  const primary = hexagramFromLines(lines.map((l) => l.yang));
  const changingLines = lines.filter((l) => l.changing).map((l) => l.position);
  let resulting: Hexagram | undefined;
  if (changingLines.length > 0) {
    resulting = hexagramFromLines(lines.map((l) => (l.changing ? 1 - l.yang : l.yang)));
  }
  return { lines, primary, resulting, changingLines };
}

/** Deterministic PRNG (mulberry32) for reproducible casts and tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
