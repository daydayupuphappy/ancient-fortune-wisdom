import { themeForDate, type DayTheme } from "../iching";

export interface EnergyWindow {
  startDay: number;
  endDay: number;
  theme: DayTheme;
  reflection: string;
}

export const REFLECTION_PROMPTS: Record<DayTheme, string> = {
  Connection: "Who could you reach out to with curiosity?",
  Action: "What first step feels possible right now?",
  Growth: "What practice deserves a little patience?",
  Reflection: "What might become clearer if you slowed down?",
  "High Energy": "What project deserves concentrated attention?",
  Creativity: "What could you try without needing it to be perfect?",
  Rest: "What would give you space to recharge?",
};

const ACTIVE: DayTheme[] = ["Action", "High Energy"];
const QUIET: DayTheme[] = ["Reflection", "Rest"];

function compatible(a: DayTheme, b: DayTheme): boolean {
  return !(ACTIVE.includes(a) && QUIET.includes(b) || QUIET.includes(a) && ACTIVE.includes(b));
}

export function computeEnergyWindows(year: number, month: number): EnergyWindow[] {
  const days = new Date(year, month, 0).getDate();
  const themes = Array.from({ length: days }, (_, index) => themeForDate(new Date(year, month - 1, index + 1)));
  const windows: EnergyWindow[] = [];

  for (let quarter = 0; quarter < 4; quarter++) {
    const first = Math.floor(quarter * days / 4) + 1;
    const last = Math.floor((quarter + 1) * days / 4);
    let best: EnergyWindow | undefined;
    for (let start = first; start < last; start++) {
      const theme = themes[start - 1];
      let end = start;
      while (end < last && end - start < 3 && themes.slice(start - 1, end).every((previous) => compatible(previous, themes[end]))) end++;
      if (end > start && (!best || end - start > best.endDay - best.startDay)) {
        best = { startDay: start, endDay: end, theme, reflection: REFLECTION_PROMPTS[theme] };
      }
    }
    if (best) windows.push(best);
  }

  return windows;
}
