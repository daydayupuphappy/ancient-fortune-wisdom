import { describe, expect, it } from "vitest";
import { buildIcs, calendarEvent, googleCalendarUrl } from "../ics";

describe("calendar exports", () => {
  it("creates an all-day event with an exclusive end date across month boundaries", () => {
    const event = calendarEvent("2026-10-31", "2026-11-02", "High Energy", "What next?");
    const ics = buildIcs([event], new Date("2026-09-27T10:30:00Z"));
    expect(event.title).toBe("⚡ Fortune Toss — High Energy Window");
    expect(event.description).toContain("\n\nTheme: High Energy\n\nReflection: What next?");
    expect(ics).toContain("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n");
    expect(ics).toContain("DTSTAMP:20260927T103000Z\r\n");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261031\r\nDTEND;VALUE=DATE:20261102\r\n");
    expect(ics).toContain("END:VEVENT\r\nEND:VCALENDAR\r\n");
    expect(ics).not.toMatch(/(?<!\r)\n/);
    expect(ics).toMatch(/UID:[^\r]+@fortune-toss\.app\r\n/);
    expect(buildIcs([event])).toContain(`UID:${event.uid}`);
  });

  it("escapes user-entered text, folds long lines, and includes every window", () => {
    const first = calendarEvent("2026-10-03", "2026-10-06", "Connection", "What about a, b; or \\c?\nNext line?");
    const second = calendarEvent("2026-10-11", "2026-10-13", "Growth", "What grows?");
    const ics = buildIcs([first, second]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics.replace(/\r\n /g, "")).toContain("Reflection: What about a\\, b\\; or \\\\c?\\nNext line?");
    expect(ics.replace(/\r\n /g, "")).toContain("Your Fortune Toss reflection suggests this may be a useful period");
    expect(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });

  it("builds a Google Calendar template with matching all-day dates and description", () => {
    const event = calendarEvent("2026-10-03", "2026-10-06", "Connection", "Who could you call?");
    const url = new URL(googleCalendarUrl(event));
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe("20261003/20261006");
    expect(url.searchParams.get("text")).toBe(event.title);
    expect(url.searchParams.get("details")).toBe(event.description);
  });
});
