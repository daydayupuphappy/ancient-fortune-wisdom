import Link from "next/link";
import { HexagramLines } from "@/components/HexagramLines";
import { THEME_EMOJI } from "@/lib/iching";
import { formatShortDate } from "@/lib/gamification";
import type { Reading } from "@/lib/reading";

interface Props {
  reading: Reading;
}

export function ReadingRow({ reading }: Props) {
  const { cast, energy } = reading;
  return (
    <li>
      <Link
        href={`/history/${reading.id}`}
        className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-cream-deep/60 sm:gap-6 sm:px-4"
      >
        <span className="w-12 shrink-0 text-xs text-stone sm:w-14 sm:text-sm">{formatShortDate(reading.dateKey)}</span>
        <span className="zh w-9 shrink-0 whitespace-nowrap text-center text-lg sm:w-12 sm:text-xl leading-none tracking-tight text-ink">{cast.primary.chinese}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug text-ink sm:truncate">
            <span className="hidden sm:inline">Hexagram </span>
            {cast.primary.number} — {cast.primary.english}
          </span>
          <span className="mt-0.5 block truncate text-xs text-stone">
            {THEME_EMOJI[energy.theme]} {energy.theme}
            {cast.resulting && <span className="hidden sm:inline"> · → <span className="zh">{cast.resulting.chinese}</span></span>}
          </span>
        </span>
        <span className="hidden shrink-0 sm:block">
          <HexagramLines lines={cast.lines} size="sm" />
        </span>
        <span className="w-8 shrink-0 text-right sm:w-10">
          <span className="display text-xl leading-none text-ink">{energy.score}</span>
        </span>
        <span className="text-stone/60 transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden>
          ›
        </span>
      </Link>
    </li>
  );
}
