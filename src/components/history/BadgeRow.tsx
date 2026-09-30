import type { Badge } from "@/lib/gamification";

interface Props {
  badges: Badge[];
}

export function BadgeRow({ badges }: Props) {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <div className="card px-6 py-5 sm:px-8">
      <div className="flex items-baseline justify-between gap-2">
        <p className="eyebrow">Badges</p>
        <p className="text-xs text-stone">
          {earned} of {badges.length} earned
        </p>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-3 sm:grid sm:grid-cols-5">
        {badges.map((b) => (
          <li
            key={b.id}
            title={b.description}
            className={`flex w-[calc(33.333%-0.5rem)] flex-col items-center rounded-2xl px-2 py-4 text-center transition sm:w-auto ${
              b.earned ? "bg-cream-deep/70" : "bg-transparent"
            }`}
          >
            <span
              className={`zh relative flex h-12 w-12 items-center justify-center rounded-full border text-xl ${
                b.earned
                  ? "border-gold bg-gradient-to-br from-gold-soft to-gold/80 text-ink shadow-soft"
                  : "border-dashed border-mist text-stone/60"
              }`}
              aria-hidden
            >
              {b.glyph}
              {!b.earned && b.progress > 0 && (
                <span
                  className="absolute -bottom-1 h-1 rounded-full bg-jade"
                  style={{ width: `${Math.max(12, b.progress * 100)}%` }}
                />
              )}
            </span>
            <span className={`mt-3 text-xs font-medium leading-snug ${b.earned ? "text-ink" : "text-stone"}`}>
              {b.title}
            </span>
            <span className="sr-only">{b.earned ? "Earned" : "Locked"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
