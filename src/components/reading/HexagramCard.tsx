import { HexagramLines } from "@/components/HexagramLines";
import type { CastResult, Hexagram } from "@/lib/iching";

function Name({ hexagram, big }: { hexagram: Hexagram; big?: boolean }) {
  return (
    <div className="text-center">
      <p className={`zh leading-none text-ink ${big ? "text-7xl sm:text-8xl" : "text-4xl"}`}>{hexagram.chinese}</p>
      <p className={`mt-3 text-stone ${big ? "text-sm" : "text-xs"}`}>{hexagram.pinyin}</p>
      <p className={`display mt-1 text-ink ${big ? "text-3xl" : "text-xl"}`}>{hexagram.english}</p>
      <p className="eyebrow mt-2">Hexagram {hexagram.number}</p>
    </div>
  );
}

export function HexagramCard({ cast }: { cast: CastResult }) {
  const { primary, resulting, changingLines } = cast;
  return (
    <div className="card px-6 py-10 sm:px-10">
      <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-14">
        <div className="flex flex-col items-center gap-8">
          <Name hexagram={primary} big />
          <HexagramLines lines={cast.lines} size="lg" />
        </div>
        {resulting && (
          <>
            <span className="display text-4xl text-gold" aria-label="changes to">
              →
            </span>
            <div className="flex flex-col items-center gap-6">
              <Name hexagram={resulting} />
              <HexagramLines lines={resulting.lines} size="md" />
            </div>
          </>
        )}
      </div>

      <div className="mt-10 grid gap-3 border-t border-mist pt-6 text-sm text-charcoal/85 sm:grid-cols-3">
        <p>
          <span className="eyebrow block">Upper</span>
          <span className="zh mr-1">{primary.upper.chinese}</span> {primary.upper.english}
        </p>
        <p>
          <span className="eyebrow block">Lower</span>
          <span className="zh mr-1">{primary.lower.chinese}</span> {primary.lower.english}
        </p>
        <p>
          <span className="eyebrow block">Changing lines</span>
          {changingLines.length ? changingLines.join(", ") : "None"}
          {resulting && <span className="text-stone"> · becomes {resulting.english}</span>}
        </p>
      </div>
    </div>
  );
}
