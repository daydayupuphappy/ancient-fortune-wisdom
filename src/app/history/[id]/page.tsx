"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HexagramLines } from "@/components/HexagramLines";
import { formatShortDate } from "@/lib/gamification";
import { LINE_GLYPH, THEME_EMOJI, type Hexagram } from "@/lib/iching";
import type { Reading } from "@/lib/reading";
import { getReading } from "@/lib/storage";

function HexagramName({ hexagram, compact = false }: { hexagram: Hexagram; compact?: boolean }) {
  return (
    <div className={compact ? "" : "text-center"}>
      <p className="eyebrow">Hexagram {hexagram.number}</p>
      <p className={`zh mt-2 leading-none text-ink ${compact ? "text-4xl" : "text-6xl sm:text-7xl"}`}>
        {hexagram.chinese}
      </p>
      <p className={`display mt-3 text-ink ${compact ? "text-xl" : "text-3xl"}`}>{hexagram.english}</p>
      <p className="mt-1 text-sm text-stone">
        {hexagram.pinyin} · <span className="zh">{hexagram.upper.chinese}</span> {hexagram.upper.english} over{" "}
        <span className="zh">{hexagram.lower.chinese}</span> {hexagram.lower.english}
      </p>
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reading, setReading] = useState<Reading | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setReading(getReading(id));
      setLoaded(true);
    };
    refresh();
    window.addEventListener("afw:readings-changed", refresh);
    return () => window.removeEventListener("afw:readings-changed", refresh);
  }, [id]);

  if (!loaded) return null;

  if (!reading) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center fade-up">
        <span className="zh text-5xl text-gold" aria-hidden>
          易
        </span>
        <h1 className="display mt-5 text-3xl text-ink">Reading not found</h1>
        <p className="mt-3 text-stone">This reading may have been cleared from this device.</p>
        <Link href="/history" className="btn-secondary mt-8">
          Back to history
        </Link>
      </section>
    );
  }

  const { cast, energy } = reading;
  const when = new Date(reading.createdAt);
  const time = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-10 fade-up">
      <Link href="/history" className="text-sm text-stone transition hover:text-ink">
        ← History
      </Link>

      <header className="mt-8 text-center">
        <p className="text-sm text-stone">
          {formatShortDate(reading.dateKey)}, {when.getFullYear()} · {time}
        </p>
        {reading.question && <p className="mt-2 italic text-charcoal">“{reading.question}”</p>}
      </header>

      <div className="card mt-8 px-6 py-10 sm:px-10">
        <div className="grid items-center gap-10 sm:grid-cols-[1fr_auto_1fr]">
          <HexagramName hexagram={cast.primary} />
          <div className="flex flex-col items-center">
            <HexagramLines lines={cast.lines} size="lg" />
            {cast.changingLines.length > 0 && (
              <p className="mt-4 text-xs text-stone">
                Changing {cast.changingLines.length === 1 ? "line" : "lines"} {cast.changingLines.join(", ")}
              </p>
            )}
          </div>
          {cast.resulting ? (
            <div className="text-center sm:text-left">
              <p className="eyebrow">Becomes</p>
              <div className="mt-2 flex items-center justify-center gap-4 sm:justify-start">
                <HexagramLines lines={cast.resulting.lines} size="sm" />
                <div>
                  <p className="zh text-3xl leading-none text-ink">{cast.resulting.chinese}</p>
                  <p className="mt-1 text-sm text-ink">
                    {cast.resulting.number} · {cast.resulting.english}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-stone sm:text-left">No changing lines — a settled reading.</p>
          )}
        </div>

        <ul className="mx-auto mt-10 max-w-xs space-y-1 border-t border-mist/60 pt-6 font-mono text-xs text-stone">
          {[...cast.lines].reverse().map((l) => (
            <li key={l.position} className="flex items-center justify-between gap-6">
              <span>
                Line {l.position}
                <span className="ml-2 text-stone/70">{l.kind.replace("-", " ")}</span>
              </span>
              <span className={l.changing ? "text-gold" : ""}>{LINE_GLYPH[l.kind]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mt-6 px-6 py-6 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="eyebrow">Energy that day</p>
            <p className="display mt-1 text-3xl text-ink">
              {energy.score} <span className="text-lg text-stone">/ 100</span>
            </p>
          </div>
          <p className="text-sm text-charcoal">
            {THEME_EMOJI[energy.theme]} {energy.label}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Attribute label="Lucky color" value={energy.luckyColor} />
          <Attribute label="Lucky number" value={energy.luckyNumber} />
          <Attribute label="Direction" value={energy.luckyDirection} />
          <Attribute label="Element" value={energy.luckyElement} />
          <Attribute label="Window" value={energy.luckyWindow} />
          <Attribute label="Focus" value={energy.focus} />
        </div>
        <p className="mt-6 text-sm italic text-charcoal">{energy.reflection}</p>
      </div>

      <div className="card mt-6 px-6 py-6 sm:px-10">
        <p className="eyebrow">Interpretation</p>
        {reading.interpretation ? (
          <p className="mt-3 whitespace-pre-line leading-relaxed text-charcoal">{reading.interpretation}</p>
        ) : (
          <>
            <p className="mt-3 leading-relaxed text-charcoal">{cast.primary.interpretation}</p>
            <p className="mt-2 text-xs text-stone">
              Classical theme: {cast.primary.theme}. Open the full reading for a modern interpretation.
            </p>
          </>
        )}
      </div>

      {reading.oracle && reading.oracle.length > 0 && (
        <div className="card mt-6 px-6 py-6 sm:px-10">
          <p className="eyebrow">Oracle</p>
          <ul className="mt-4 space-y-5">
            {reading.oracle.map((qa) => (
              <li key={qa.askedAt}>
                <p className="font-medium text-ink">{qa.question}</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-charcoal">{qa.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href={`/reading?id=${reading.id}`} className="btn-primary">
          Open full reading
        </Link>
        <Link href={`/oracle?id=${reading.id}`} className="btn-secondary">
          Ask the Oracle
        </Link>
        <Link href={`/share?id=${reading.id}`} className="btn-secondary">
          Share
        </Link>
      </div>
    </section>
  );
}
