"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarActions } from "@/components/calendar/CalendarActions";
import { calendarEvent } from "@/lib/calendar/ics";
import { computeEnergyWindows, REFLECTION_PROMPTS } from "@/lib/calendar/windows";
import { dateKey, themeForDate, THEME_EMOJI, THEME_GOOD_FOR } from "@/lib/iching";
import type { Reading } from "@/lib/reading";
import { loadReadings } from "@/lib/storage";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    const refresh = () => setReadings(loadReadings());
    refresh();
    window.addEventListener("afw:readings-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("afw:readings-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(month);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const windows = computeEnergyWindows(year, monthIndex + 1);
  const todayKey = dateKey(new Date());
  const byDate = new Map<string, Reading>();
  for (const reading of readings) {
    if (!byDate.has(reading.dateKey)) byDate.set(reading.dateKey, reading);
  }

  function navigate(delta: number) {
    setMonth(new Date(year, monthIndex + delta, 1));
    setSelectedDay(null);
  }

  const selectedDate = selectedDay === null ? null : new Date(year, monthIndex, selectedDay);
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedReading = selectedKey ? byDate.get(selectedKey) : undefined;
  const detailTheme = selectedDate ? selectedReading?.energy.theme ?? themeForDate(selectedDate) : null;
  const reflection = detailTheme ? selectedReading?.energy.reflection ?? REFLECTION_PROMPTS[detailTheme] : null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 fade-up sm:px-6 sm:pt-16 lg:px-8">
      <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
        <div>
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-gold" /> A space to reflect · 月历</p>
          <h1 className="display mt-4 text-5xl leading-none sm:text-7xl">The lucky calendar<span className="text-gold">.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-stone sm:text-base">A gentle guide to each day&apos;s energy. Explore a moment, revisit a reading, or make space for reflection.</p>
        </div>
        <span className="zh hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gold/50 text-4xl text-gold/70 sm:flex" aria-hidden>易</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(270px,1fr)] lg:gap-6">
        <div className="card overflow-hidden !rounded-[1.75rem]">
          <div className="flex items-center justify-between gap-3 border-b border-mist px-4 py-5 sm:px-7 sm:py-6">
            <div>
              <p className="eyebrow">A new perspective, every day</p>
              <h2 className="display mt-1 text-3xl sm:text-4xl">{monthName} <span className="text-stone">{year}</span></h2>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button type="button" onClick={() => navigate(-1)} aria-label="Previous month" className="flex h-10 w-10 items-center justify-center rounded-full border border-mist text-xl text-charcoal transition hover:border-gold hover:bg-cream">‹</button>
              <button type="button" onClick={() => navigate(1)} aria-label="Next month" className="flex h-10 w-10 items-center justify-center rounded-full border border-mist text-xl text-charcoal transition hover:border-gold hover:bg-cream">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-mist/70 bg-cream/60 px-2 py-3 sm:px-4">
            {WEEKDAYS.map((day) => <span key={day} className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-stone sm:text-xs">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 p-2 sm:gap-1.5 sm:p-4">
            {Array.from({ length: offset }, (_, index) => <div key={`empty-${index}`} aria-hidden />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const dayDate = new Date(year, monthIndex, day);
              const key = dateKey(dayDate);
              const reading = byDate.get(key);
              const energy = reading?.energy.theme ?? themeForDate(dayDate);
              const isSelected = day === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  aria-label={`${dayDate.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, ${energy}${reading ? `, reading ${reading.cast.primary.number}` : ""}`}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-[70px] flex-col items-center rounded-xl border px-0.5 py-2 text-center transition sm:min-h-[90px] sm:rounded-2xl sm:py-3 ${isSelected ? "border-gold bg-gold-soft/35 shadow-sm" : "border-transparent hover:border-mist hover:bg-cream"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm ${key === todayKey ? "bg-ink text-paper" : "text-charcoal"}`}>{day}</span>
                  <span aria-hidden className="mt-0.5 text-base leading-none sm:mt-1 sm:text-xl">{THEME_EMOJI[energy]}</span>
                  <span className="hidden max-w-full truncate px-0.5 pt-1 text-[10px] text-stone sm:block">{energy}</span>
                  {reading && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-jade sm:bottom-1.5" aria-hidden />}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-mist/70 px-5 py-4 text-[11px] text-stone sm:px-7">
            <span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-jade" />Saved reading</span>
            <span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-ink" />Today</span>
            <span>Tap a day to explore its theme</span>
          </div>
        </div>

        <aside className="card p-6 sm:p-8 lg:sticky lg:top-24" aria-live="polite">
          {selectedDate && detailTheme && reflection && selectedDay !== null ? (
            <>
              <p className="eyebrow">A closer look · 今日</p>
              <p className="display mt-5 text-3xl leading-tight sm:text-4xl">{selectedDate.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</p>
              <div className="my-7 h-px bg-mist" />
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-soft/50 text-2xl" aria-hidden>{THEME_EMOJI[detailTheme]}</span>
                <div><p className="eyebrow">Day&apos;s theme</p><p className="mt-1 text-lg font-medium text-ink">{detailTheme}</p></div>
              </div>
              <p className="eyebrow mt-8">Good for</p>
              <p className="mt-2 text-sm leading-7 text-charcoal">{THEME_GOOD_FOR[detailTheme]}</p>
              <div className="mt-7 rounded-2xl bg-cream px-5 py-5">
                <p className="eyebrow">A question to carry</p>
                <p className="display mt-2 text-xl leading-snug text-ink">{reflection}</p>
              </div>
              {selectedReading ? (
                <Link href={`/reading?id=${encodeURIComponent(selectedReading.id)}`} className="mt-6 inline-block text-sm font-medium text-jade underline decoration-jade/50 underline-offset-4 hover:text-ink">View your reading · Hexagram {selectedReading.cast.primary.number} ↗</Link>
              ) : (
                <p className="mt-6 text-xs leading-5 text-stone">No reading for this day yet. <Link href="/" className="underline underline-offset-2 hover:text-ink">Toss your fortune</Link> to begin.</p>
              )}
              <div className="mt-7 border-t border-mist pt-6">
                <CalendarActions
                  events={[calendarEvent(dateKey(selectedDate), dateKey(new Date(year, monthIndex, selectedDay + 1)), detailTheme, reflection)]}
                  filename={`fortune-toss-${selectedKey}.ics`}
                />
              </div>
            </>
          ) : (
            <div className="py-12 text-center"><span className="zh text-4xl text-gold">易</span><p className="display mt-5 text-2xl">Choose a day</p><p className="mt-2 text-sm text-stone">Select a date to see its theme and reflection.</p></div>
          )}
        </aside>
      </div>

      <div className="mt-16 sm:mt-20">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Moments to notice · 节气</p><h2 className="display mt-2 text-4xl sm:text-5xl">Monthly energy windows</h2><p className="mt-3 max-w-xl text-sm leading-6 text-stone">Short stretches for pausing, connecting, and choosing your next step.</p></div>
          <CalendarActions
            events={windows.map((window) => calendarEvent(dateKey(new Date(year, monthIndex, window.startDay)), dateKey(new Date(year, monthIndex, window.endDay + 1)), window.theme, window.reflection))}
            filename={`fortune-toss-${year}-${String(monthIndex + 1).padStart(2, "0")}-windows.ics`}
            label={`Add All ${monthName} Energy Windows`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {windows.map((window, index) => {
            const event = calendarEvent(dateKey(new Date(year, monthIndex, window.startDay)), dateKey(new Date(year, monthIndex, window.endDay + 1)), window.theme, window.reflection);
            return (
              <article key={window.startDay} className="card flex flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between"><p className="eyebrow">Window 0{index + 1}</p><span className="text-xl" aria-hidden>{THEME_EMOJI[window.theme]}</span></div>
                <p className="display mt-5 text-3xl leading-none">{monthName} {window.startDay}–{window.endDay}</p>
                <p className="mt-3 text-sm font-medium text-jade">{window.theme}</p>
                <div className="my-5 h-px bg-mist/80" />
                <p className="text-xs leading-5 text-stone">Good for: <span className="text-charcoal">{THEME_GOOD_FOR[window.theme]}</span></p>
                <p className="mt-4 grow text-sm italic leading-6 text-charcoal">“{window.reflection}”</p>
                <div className="mt-6 border-t border-mist/80 pt-5"><CalendarActions events={[event]} filename={`fortune-toss-${event.start}-window.ics`} /></div>
              </article>
            );
          })}
        </div>
        <p className="mt-7 text-center text-xs leading-6 text-stone">These symbolic themes are invitations to reflect, not predictions about what will happen.</p>
      </div>
    </section>
  );
}
