import { HexagramLines } from "@/components/HexagramLines";
import { THEME_EMOJI } from "@/lib/iching";
import type { Reading } from "@/lib/reading";

export function ReadingSummaryCard({ reading }: { reading: Reading }) {
  const { primary, resulting, changingLines } = reading.cast;
  const date = new Date(reading.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="card fade-up flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-center gap-5">
        <HexagramLines lines={reading.cast.lines} size="sm" className="mr-3 shrink-0" />
        <div className="min-w-0">
          <p className="eyebrow">
            Consulting · Hexagram {primary.number} · {date}
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="zh text-4xl leading-none text-ink">{primary.chinese}</span>
            <h1 className="display truncate text-2xl text-ink sm:text-3xl">{primary.english}</h1>
          </div>
          <p className="mt-2 text-sm text-stone">
            <span className="text-charcoal">{primary.theme}</span>
            <span className="mx-2 text-mist">·</span>
            {THEME_EMOJI[reading.energy.theme]} {reading.energy.theme} day
          </p>
        </div>
      </div>

      {resulting ? (
        <div className="flex items-center gap-4 rounded-2xl border border-mist/70 bg-cream/60 px-4 py-3 sm:flex-col sm:items-end sm:border-0 sm:bg-transparent sm:p-0 sm:text-right">
          <div>
            <p className="eyebrow">
              Moving toward · {changingLines.length} changing {changingLines.length === 1 ? "line" : "lines"}
            </p>
            <p className="mt-1 text-sm text-charcoal">
              <span className="zh mr-2 text-lg text-ink">{resulting.chinese}</span>
              {resulting.number} · {resulting.english}
            </p>
          </div>
          <HexagramLines lines={resulting.lines} size="sm" className="ml-auto shrink-0 sm:ml-0" />
        </div>
      ) : (
        <p className="text-sm text-stone sm:max-w-[12rem] sm:text-right">
          No changing lines — the symbolism rests in a single, settled image.
        </p>
      )}
    </div>
  );
}
