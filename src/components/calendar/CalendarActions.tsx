"use client";

import { buildIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/calendar/ics";

interface CalendarActionsProps {
  events: CalendarEvent[];
  filename: string;
  label?: string;
}

export function CalendarActions({ events, filename, label = "Add to Calendar" }: CalendarActionsProps) {
  function download() {
    const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={download} className="btn-primary !px-5 !py-3 !text-[11px] !tracking-[0.12em]">
        <span aria-hidden>↓</span> {label}
      </button>
      {events.length === 1 && (
        <a
          href={googleCalendarUrl(events[0])}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-charcoal underline decoration-gold/70 underline-offset-4 transition hover:text-ink"
        >
          Open in Google Calendar ↗
        </a>
      )}
    </div>
  );
}
