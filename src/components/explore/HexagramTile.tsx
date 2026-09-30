import Link from "next/link";
import { HexagramLines } from "@/components/HexagramLines";
import type { Hexagram } from "@/lib/iching";

export function HexagramTile({ hexagram: h, style }: { hexagram: Hexagram; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/explore/${h.number}`}
      style={style}
      className="card group flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-0.5 hover:border-gold/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold fade-up"
    >
      <span className="eyebrow">No. {h.number}</span>
      <HexagramLines lines={h.lines} size="sm" className="my-1" />
      <span className="zh text-3xl leading-none text-ink">{h.chinese}</span>
      <div>
        <p className="text-sm font-medium text-ink">{h.english}</p>
        <p className="mt-0.5 text-xs text-stone">{h.pinyin}</p>
      </div>
      <span className="mt-auto rounded-full bg-gold-soft/50 px-2.5 py-0.5 text-[11px] text-charcoal">{h.theme}</span>
    </Link>
  );
}
