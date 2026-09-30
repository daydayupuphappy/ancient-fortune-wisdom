import Link from "next/link";
import type { Trigram } from "@/lib/iching";

interface Props {
  trigram: Trigram;
  /** Where the card links to. Defaults to the filtered explore grid. */
  href?: string | null;
  /** Small label shown above the card, e.g. "Upper" / "Lower". */
  label?: string;
  compact?: boolean;
  className?: string;
}

export function TrigramGlyph({ lines, size = "md" }: { lines: readonly (0 | 1)[]; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-1" : "h-1.5";
  const w = size === "sm" ? "w-10" : "w-14";
  return (
    <div className={`flex flex-col-reverse items-center gap-1.5 ${w}`} aria-hidden>
      {lines.map((l, i) =>
        l ? (
          <span key={i} className={`block w-full ${h} rounded-full bg-ink`} />
        ) : (
          <span key={i} className="flex w-full items-center justify-between gap-[18%]">
            <span className={`block w-full ${h} rounded-full bg-ink`} />
            <span className={`block w-full ${h} rounded-full bg-ink`} />
          </span>
        ),
      )}
    </div>
  );
}

export function TrigramCard({ trigram, href, label, compact = false, className = "" }: Props) {
  const target = href === undefined ? `/explore?upper=${trigram.key}#hexagrams` : href;
  const body = (
    <div
      className={`card flex h-full flex-col gap-4 p-5 transition ${
        target ? "hover:-translate-y-0.5 hover:border-gold/70" : ""
      } ${className}`}
    >
      {label && <span className="eyebrow">{label}</span>}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="zh text-4xl leading-none text-ink">{trigram.chinese}</span>
          <p className="mt-2 text-sm text-stone">{trigram.pinyin}</p>
          <p className="display text-2xl text-ink">{trigram.english}</p>
        </div>
        <TrigramGlyph lines={trigram.lines} />
      </div>
      {!compact && (
        <dl className="grid grid-cols-3 gap-2 border-t border-mist pt-4 text-xs">
          <div>
            <dt className="text-stone">Element</dt>
            <dd className="mt-0.5 font-medium text-charcoal">{trigram.element}</dd>
          </div>
          <div>
            <dt className="text-stone">Direction</dt>
            <dd className="mt-0.5 font-medium text-charcoal">{trigram.direction}</dd>
          </div>
          <div>
            <dt className="text-stone">Family</dt>
            <dd className="mt-0.5 font-medium text-charcoal">{trigram.family}</dd>
          </div>
        </dl>
      )}
      <ul className="flex flex-wrap gap-1.5">
        {trigram.qualities.map((q) => (
          <li key={q} className="rounded-full bg-jade-soft/60 px-2.5 py-0.5 text-[11px] text-charcoal">
            {q}
          </li>
        ))}
      </ul>
    </div>
  );
  if (!target) return body;
  return (
    <Link href={target} className="block h-full rounded-[var(--radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      {body}
    </Link>
  );
}
