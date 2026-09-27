export type TrigramKey =
  | "heaven"
  | "earth"
  | "thunder"
  | "wind"
  | "water"
  | "fire"
  | "mountain"
  | "lake";

/** Line values, bottom to top. 1 = yang (solid), 0 = yin (broken). */
export type LinePattern = readonly [0 | 1, 0 | 1, 0 | 1];

export interface Trigram {
  key: TrigramKey;
  chinese: string;
  pinyin: string;
  english: string;
  element: string;
  direction: string;
  family: string;
  qualities: string[];
  /** Bottom to top. */
  lines: LinePattern;
}

export const TRIGRAMS: Record<TrigramKey, Trigram> = {
  heaven: {
    key: "heaven",
    chinese: "乾",
    pinyin: "Qián",
    english: "Heaven",
    element: "Metal",
    direction: "Northwest",
    family: "Father",
    qualities: ["strength", "initiative", "clarity", "leadership"],
    lines: [1, 1, 1],
  },
  earth: {
    key: "earth",
    chinese: "坤",
    pinyin: "Kūn",
    english: "Earth",
    element: "Earth",
    direction: "Southwest",
    family: "Mother",
    qualities: ["receptivity", "nourishment", "patience", "support"],
    lines: [0, 0, 0],
  },
  thunder: {
    key: "thunder",
    chinese: "震",
    pinyin: "Zhèn",
    english: "Thunder",
    element: "Wood",
    direction: "East",
    family: "Eldest son",
    qualities: ["movement", "awakening", "courage", "sudden change"],
    lines: [1, 0, 0],
  },
  wind: {
    key: "wind",
    chinese: "巽",
    pinyin: "Xùn",
    english: "Wind",
    element: "Wood",
    direction: "Southeast",
    family: "Eldest daughter",
    qualities: ["gentleness", "penetration", "persistence", "influence"],
    lines: [0, 1, 1],
  },
  water: {
    key: "water",
    chinese: "坎",
    pinyin: "Kǎn",
    english: "Water",
    element: "Water",
    direction: "North",
    family: "Middle son",
    qualities: ["depth", "flow", "uncertainty", "resilience"],
    lines: [0, 1, 0],
  },
  fire: {
    key: "fire",
    chinese: "离",
    pinyin: "Lí",
    english: "Fire",
    element: "Fire",
    direction: "South",
    family: "Middle daughter",
    qualities: ["clarity", "warmth", "expression", "attention"],
    lines: [1, 0, 1],
  },
  mountain: {
    key: "mountain",
    chinese: "艮",
    pinyin: "Gèn",
    english: "Mountain",
    element: "Earth",
    direction: "Northeast",
    family: "Youngest son",
    qualities: ["stillness", "boundaries", "grounding", "pause"],
    lines: [0, 0, 1],
  },
  lake: {
    key: "lake",
    chinese: "兑",
    pinyin: "Duì",
    english: "Lake",
    element: "Metal",
    direction: "West",
    family: "Youngest daughter",
    qualities: ["joy", "openness", "communication", "pleasure"],
    lines: [1, 1, 0],
  },
};

export const TRIGRAM_LIST: Trigram[] = Object.values(TRIGRAMS);

export function trigramFromLines(lines: LinePattern): Trigram {
  const found = TRIGRAM_LIST.find(
    (t) => t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2],
  );
  if (!found) throw new Error(`No trigram for lines ${lines.join("")}`);
  return found;
}
