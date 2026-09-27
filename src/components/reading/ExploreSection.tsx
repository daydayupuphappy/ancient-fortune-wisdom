"use client";

import Link from "next/link";
import { useState } from "react";
import type { Hexagram, Trigram } from "@/lib/iching";

function TrigramDetail({ label, trigram }: { label: string; trigram: Trigram }) {
  return (
    <div className="rounded-2xl border border-mist bg-cream/60 px-5 py-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="zh text-3xl text-ink">{trigram.chinese}</span>
        <span className="display text-xl text-ink">{trigram.english}</span>
        <span className="text-xs text-stone">{trigram.pinyin}</span>
      </p>
      <p className="mt-2 text-xs text-charcoal/80">
        {trigram.element} · {trigram.direction} · {trigram.family}
      </p>
      <p className="mt-1 text-xs text-stone">{trigram.qualities.join(", ")}</p>
    </div>
  );
}

export function ExploreSection({ hexagram }: { hexagram: Hexagram }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-6 py-5 text-left sm:px-8"
      >
        <span>
          <span className="eyebrow block">Explore this hexagram</span>
          <span className="display mt-1 block text-xl text-ink">
            {hexagram.number} · {hexagram.english}
          </span>
        </span>
        <span
          className={`text-stone transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-mist px-6 pb-7 pt-6 fade-up sm:px-8">
          <p className="text-sm leading-relaxed text-charcoal">
            <span className="font-medium text-ink">{hexagram.theme}.</span> {hexagram.interpretation}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <TrigramDetail label="Upper trigram" trigram={hexagram.upper} />
            <TrigramDetail label="Lower trigram" trigram={hexagram.lower} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {hexagram.keywords.map((k) => (
              <span key={k} className="rounded-full border border-mist bg-paper px-3 py-1 text-xs text-charcoal">
                {k}
              </span>
            ))}
          </div>
          <Link href={`/explore/${hexagram.number}`} className="btn-secondary mt-7">
            Read more about <span className="zh">{hexagram.chinese}</span> →
          </Link>
        </div>
      )}
    </div>
  );
}
