import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HexagramLines } from "@/components/HexagramLines";
import { TrigramCard } from "@/components/explore/TrigramCard";
import { HEXAGRAMS, getHexagram, type Hexagram } from "@/lib/iching";
import { nextHexagramNumber, oppositeHexagram, prevHexagramNumber, swappedHexagram } from "@/lib/explore";

export const dynamicParams = false;

export function generateStaticParams() {
  return HEXAGRAMS.map((h) => ({ number: String(h.number) }));
}

function parseNumber(raw: string): Hexagram | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 64) return null;
  return getHexagram(n);
}

export async function generateMetadata({ params }: PageProps<"/explore/[number]">): Promise<Metadata> {
  const { number } = await params;
  const h = parseNumber(number);
  if (!h) return { title: "Hexagram not found" };
  return {
    title: `${h.number}. ${h.chinese} ${h.english} (${h.pinyin}) — Ancient Fortune Wisdom`,
    description: `${h.theme}: ${h.interpretation}`,
  };
}

function RelatedLink({ hexagram: h, label, note }: { hexagram: Hexagram; label: string; note: string }) {
  return (
    <Link
      href={`/explore/${h.number}`}
      className="card flex items-center gap-5 p-5 transition hover:-translate-y-0.5 hover:border-gold/70"
    >
      <HexagramLines lines={h.lines} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">{label}</p>
        <p className="mt-1 truncate text-ink">
          <span className="zh mr-2 text-xl">{h.chinese}</span>
          <span className="font-medium">
            {h.number}. {h.english}
          </span>
        </p>
        <p className="mt-1 text-xs text-stone">{note}</p>
      </div>
      <span aria-hidden className="text-stone">
        →
      </span>
    </Link>
  );
}

function NavLink({ n, direction }: { n: number; direction: "prev" | "next" }) {
  const h = getHexagram(n);
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/explore/${n}`}
      rel={direction}
      className={`card flex items-center gap-4 p-4 transition hover:border-gold/70 ${isPrev ? "" : "flex-row-reverse text-right"}`}
    >
      <span aria-hidden className="text-stone">
        {isPrev ? "←" : "→"}
      </span>
      <div className="min-w-0">
        <p className="eyebrow">{isPrev ? "Previous" : "Next"}</p>
        <p className="truncate text-sm text-ink">
          <span className="zh mr-1.5">{h.chinese}</span>
          {h.number}. {h.english}
        </p>
      </div>
    </Link>
  );
}

export default async function HexagramPage({ params }: PageProps<"/explore/[number]">) {
  const { number } = await params;
  const h = parseNumber(number);
  if (!h) notFound();

  const opposite = oppositeHexagram(h);
  const swapped = swappedHexagram(h);
  const doubled = h.upper.key === h.lower.key;

  return (
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-12 fade-up">
      <nav aria-label="Breadcrumb" className="text-xs text-stone">
        <Link href="/explore" className="hover:text-ink">
          Explore
        </Link>
        <span className="mx-2">/</span>
        <span>Hexagram {h.number}</span>
      </nav>

      {/* Hero */}
      <header className="mt-10 grid items-center gap-12 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">
            Hexagram {h.number} of 64 · {h.theme}
          </p>
          <div className="mt-6 flex items-end gap-6">
            <span className="zh text-[6rem] leading-none text-ink sm:text-[7.5rem]">{h.chinese}</span>
            <div className="pb-3">
              <p className="text-lg text-stone">{h.pinyin}</p>
              <h1 className="display mt-1 text-4xl leading-[1.05] text-ink sm:text-5xl">{h.english}</h1>
            </div>
          </div>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-charcoal/85">{h.interpretation}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Keywords">
            {h.keywords.map((k) => (
              <li key={k} className="rounded-full border border-gold/50 bg-gold-soft/30 px-3 py-1 text-xs text-charcoal">
                {k}
              </li>
            ))}
          </ul>
        </div>
        <div className="card flex flex-col items-center gap-6 px-10 py-10 md:px-14">
          <span className="eyebrow">Top</span>
          <HexagramLines lines={h.lines} size="lg" className="gap-3" />
          <span className="eyebrow">Bottom</span>
        </div>
      </header>

      {/* Structure */}
      <section aria-labelledby="structure-heading" className="mt-20">
        <p className="eyebrow">Structure</p>
        <h2 id="structure-heading" className="display mt-2 text-3xl text-ink">
          {doubled ? (
            <>
              {h.upper.english} doubled
            </>
          ) : (
            <>
              {h.upper.english} over {h.lower.english}
            </>
          )}
        </h2>
        <p className="mt-3 max-w-2xl text-charcoal/80">
          Read a hexagram from the bottom up: the lower trigram is the inner situation or starting point, the upper
          trigram is the outer situation or direction things lean toward.
          {doubled && " When the same trigram appears twice, its quality is emphasized."}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <TrigramCard trigram={h.upper} label="Upper · outer" href={`/explore?upper=${h.upper.key}#hexagrams`} />
          <TrigramCard trigram={h.lower} label="Lower · inner" href={`/explore?lower=${h.lower.key}#hexagrams`} />
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="related-heading" className="mt-20">
        <p className="eyebrow">Related</p>
        <h2 id="related-heading" className="display mt-2 text-3xl text-ink">
          Its mirrors
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <RelatedLink hexagram={opposite} label="Opposite" note="Every line flipped, yin for yang" />
          {swapped && <RelatedLink hexagram={swapped} label="Swapped" note="Upper and lower trigrams exchanged" />}
        </div>
      </section>

      {/* CTA */}
      <section className="card mt-20 flex flex-col items-center gap-5 bg-gradient-to-br from-paper to-cream-deep px-8 py-14 text-center">
        <span className="zh text-3xl text-gold">易</span>
        <h2 className="display text-3xl text-ink">Which hexagram is yours today?</h2>
        <p className="max-w-md text-charcoal/80">
          Six coin tosses build a hexagram line by line. See what the symbolism emphasizes for you.
        </p>
        <Link href="/" className="btn-primary mt-2">
          Toss my fortune
        </Link>
      </section>

      <nav aria-label="Hexagram navigation" className="mt-12 grid gap-4 sm:grid-cols-2">
        <NavLink n={prevHexagramNumber(h.number)} direction="prev" />
        <NavLink n={nextHexagramNumber(h.number)} direction="next" />
      </nav>
    </article>
  );
}
