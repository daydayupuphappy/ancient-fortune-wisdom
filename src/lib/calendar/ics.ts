import { hashString, THEME_EMOJI, THEME_GOOD_FOR, type DayTheme } from "../iching";

export interface CalendarEvent {
  start: string;
  end: string;
  title: string;
  description: string;
  uid: string;
}

export function calendarEvent(start: string, end: string, theme: DayTheme, reflection: string): CalendarEvent {
  return {
    start,
    end,
    title: `${THEME_EMOJI[theme]} Fortune Toss — ${theme} Window`,
    description: `Your Fortune Toss reflection suggests this may be a useful period for ${THEME_GOOD_FOR[theme].toLowerCase()}.\n\nTheme: ${theme}\n\nReflection: ${reflection}`,
    uid: `${start.replaceAll("-", "")}-${hashString(`${end}:${theme}`).toString(16)}@fortune-toss.app`,
  };
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function foldLine(line: string): string {
  const lines: string[] = [];
  let part = "";
  let bytes = 0;
  for (const character of line) {
    const size = new TextEncoder().encode(character).length;
    if (bytes + size > 75) {
      lines.push(part);
      part = " ";
      bytes = 1;
    }
    part += character;
    bytes += size;
  }
  lines.push(part);
  return lines.join("\r\n");
}

export function buildIcs(events: CalendarEvent[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fortune Toss//Lucky Calendar//EN", "CALSCALE:GREGORIAN"];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${event.start.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${event.end.replaceAll("-", "")}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("dates", `${event.start.replaceAll("-", "")}/${event.end.replaceAll("-", "")}`);
  url.searchParams.set("details", event.description);
  return url.toString();
}
