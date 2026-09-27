import type { Hexagram } from "./hexagrams";
import type { CastResult } from "./toss";

export type EnergyLabel =
  | "Exceptional Day"
  | "Momentum Day"
  | "Connection Day"
  | "Creative Day"
  | "Growth Day"
  | "Reflection Day"
  | "Rest Day";

export type DayTheme =
  | "Connection"
  | "Action"
  | "Growth"
  | "Reflection"
  | "High Energy"
  | "Creativity"
  | "Rest";

export const THEME_EMOJI: Record<DayTheme, string> = {
  Connection: "✨",
  Action: "🔥",
  Growth: "🌿",
  Reflection: "🌙",
  "High Energy": "⚡",
  Creativity: "🎨",
  Rest: "☁️",
};

export const THEME_GOOD_FOR: Record<DayTheme, string> = {
  Connection: "Networking, conversations, reconnecting",
  Action: "Decisions, launching, bold first steps",
  Growth: "Learning, long-term projects, steady practice",
  Reflection: "Rest, journaling, planning",
  "High Energy": "Focused work, important meetings, momentum",
  Creativity: "Making, brainstorming, expression",
  Rest: "Slowing down, recovery, gentle routines",
};

export interface DailyEnergy {
  score: number;
  label: EnergyLabel;
  theme: DayTheme;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  luckyElement: string;
  /** e.g. "4:00 PM – 6:00 PM" */
  luckyWindow: string;
  focus: string;
  favors: string[];
  avoid: string[];
  reflection: string;
}

/** Small deterministic hash for strings (FNV-1a). */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** YYYY-MM-DD in local time. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const COLORS = ["Amber", "Jade", "Ink", "Ivory", "Vermilion", "Indigo", "Gold", "Moss", "Rose", "Slate"];
const WINDOWS = [
  "6:00 AM – 8:00 AM",
  "8:00 AM – 10:00 AM",
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
  "6:00 PM – 8:00 PM",
  "8:00 PM – 10:00 PM",
];

const TRIGRAM_THEME: Record<string, DayTheme> = {
  heaven: "High Energy",
  earth: "Rest",
  thunder: "Action",
  wind: "Growth",
  water: "Reflection",
  fire: "Creativity",
  mountain: "Reflection",
  lake: "Connection",
};

const THEME_LABEL: Record<DayTheme, EnergyLabel> = {
  "High Energy": "Momentum Day",
  Action: "Momentum Day",
  Connection: "Connection Day",
  Creativity: "Creative Day",
  Growth: "Growth Day",
  Reflection: "Reflection Day",
  Rest: "Rest Day",
};

const THEME_FOCUS: Record<DayTheme, string> = {
  Connection: "Connection",
  Action: "Decisive action",
  Growth: "Steady progress",
  Reflection: "Inner clarity",
  "High Energy": "Focused momentum",
  Creativity: "Expression",
  Rest: "Restoration",
};

const THEME_FAVORS: Record<DayTheme, string[]> = {
  Connection: ["Important conversations", "Reconnecting with someone", "Collaboration", "Listening closely"],
  Action: ["Making a decision", "Starting something", "Taking a first step", "Clearing a backlog"],
  Growth: ["Learning", "Making progress on a long-term project", "Practicing a skill", "Planting seeds"],
  Reflection: ["Journaling", "Planning", "Quiet time", "Reviewing what matters"],
  "High Energy": ["Focused deep work", "Important meetings", "Pitching an idea", "Physical activity"],
  Creativity: ["Brainstorming", "Making something", "Expressing yourself", "Exploring a new idea"],
  Rest: ["Slowing down", "Gentle routines", "Recovery", "Time in nature"],
};

const THEME_AVOID: Record<DayTheme, string[]> = {
  Connection: ["Isolating yourself", "Assuming instead of asking", "Rushing a conversation"],
  Action: ["Overthinking", "Waiting for perfect conditions", "Acting from frustration"],
  Growth: ["Rushing decisions", "Trying to control outcomes", "Taking on too many commitments"],
  Reflection: ["Big irreversible choices", "Overscheduling", "Reacting quickly"],
  "High Energy": ["Scattering attention", "Overcommitting", "Skipping rest"],
  Creativity: ["Self-criticism", "Perfectionism", "Comparing yourself to others"],
  Rest: ["Forcing productivity", "Pushing through fatigue", "New obligations"],
};

const THEME_REFLECTION: Record<DayTheme, string[]> = {
  Connection: ["Who would be glad to hear from you today?", "Where would listening change the conversation?"],
  Action: ["What decision have you been circling that is ready to be made?", "What is the smallest bold step available?"],
  Growth: ["What small action today would move something important forward?", "Where would patience produce a better outcome than force?"],
  Reflection: ["What are you ready to see more clearly?", "What deserves a slower look today?"],
  "High Energy": ["What deserves your full attention today?", "Where can momentum be directed rather than spent?"],
  Creativity: ["What wants to be made through you today?", "Where could playfulness open a door?"],
  Rest: ["What would restore you today?", "What can wait until you have more energy?"],
};

export function themeForHexagram(hexagram: Hexagram): DayTheme {
  const upper = TRIGRAM_THEME[hexagram.upper.key];
  const lower = TRIGRAM_THEME[hexagram.lower.key];
  if (upper === lower) return upper;
  // The upper trigram (outer situation) leads, unless the hexagram itself
  // is one of the classic "stillness" or "peak" hexagrams.
  if ([52, 12, 47, 29].includes(hexagram.number)) return "Reflection";
  if ([1, 11, 14, 34, 55].includes(hexagram.number)) return "High Energy";
  return upper;
}

/**
 * Derive playful daily attributes from a cast and date.
 * Fully deterministic: same cast + same date => same result.
 */
export function deriveDailyEnergy(cast: CastResult, date: Date): DailyEnergy {
  const hexagram = cast.primary;
  const seed = hashString(`${dateKey(date)}:${hexagram.number}:${cast.changingLines.join("")}`);
  const pick = (n: number, salt: number) => (Math.imul(seed ^ salt, 2654435761) >>> 0) % n;

  const theme = themeForHexagram(hexagram);
  const yangCount = hexagram.lines.filter((l) => l === 1).length;
  const base = 55 + yangCount * 4 + cast.changingLines.length * 2;
  const score = Math.min(98, Math.max(38, base + pick(21, 7) - 10));

  let label: EnergyLabel = THEME_LABEL[theme];
  if (score >= 90) label = "Exceptional Day";

  return {
    score,
    label,
    theme,
    luckyColor: COLORS[pick(COLORS.length, 11)],
    luckyNumber: 1 + pick(9, 13),
    luckyDirection: hexagram.upper.direction,
    luckyElement: hexagram.lower.element,
    luckyWindow: WINDOWS[pick(WINDOWS.length, 17)],
    focus: THEME_FOCUS[theme],
    favors: THEME_FAVORS[theme],
    avoid: THEME_AVOID[theme],
    reflection: THEME_REFLECTION[theme][pick(THEME_REFLECTION[theme].length, 19)],
  };
}

/**
 * Symbolic theme for an arbitrary calendar day (used by the lucky calendar).
 * Deterministic per date so the calendar is stable across reloads.
 */
export function themeForDate(date: Date): DayTheme {
  const themes: DayTheme[] = ["Connection", "Action", "Growth", "Reflection", "High Energy", "Creativity", "Rest"];
  return themes[hashString(dateKey(date)) % themes.length];
}
