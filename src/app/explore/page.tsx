import type { Metadata } from "next";
import { Suspense } from "react";
import { TRIGRAM_LIST } from "@/lib/iching";
import { ExploreBrowser } from "@/components/explore/ExploreBrowser";
import { TrigramCard } from "@/components/explore/TrigramCard";

export const metadata: Metadata = {
  title: "Explore the 64 Hexagrams — Ancient Fortune Wisdom",
  description:
    "Browse all 64 I Ching hexagrams and the eight trigrams. Search by number, Chinese name, pinyin, English name, or theme.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 fade-up">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Encyclopedia</p>
        <h1 className="display mt-4 text-5xl leading-[1.05] text-ink sm:text-6xl">
          Sixty-four ways to read a moment
        </h1>
        <p className="mt-5 text-lg text-charcoal/80">
          Every hexagram is two trigrams stacked, one over the other. Start with the eight building blocks, then
          wander the whole set.
        </p>
      </header>

      <section aria-labelledby="trigrams-heading" className="mt-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">
              <span className="zh mr-2 text-sm">八卦</span>Eight trigrams
            </p>
            <h2 id="trigrams-heading" className="display mt-2 text-3xl text-ink">
              The building blocks
            </h2>
          </div>
          <p className="max-w-sm text-sm text-stone">
            Three lines each, yang (solid) or yin (broken). Tap a trigram to see the eight hexagrams it sits above.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRIGRAM_LIST.map((t) => (
            <li key={t.key}>
              <TrigramCard trigram={t} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hexagrams-heading" className="mt-20">
        <div className="mb-8">
          <p className="eyebrow">
            <span className="zh mr-2 text-sm">六十四卦</span>Sixty-four hexagrams
          </p>
          <h2 id="hexagrams-heading" className="display mt-2 text-3xl text-ink">
            The whole set
          </h2>
        </div>
        <Suspense fallback={<div className="card h-40 animate-pulse" />}>
          <ExploreBrowser />
        </Suspense>
      </section>
    </div>
  );
}
