import { THEME_EMOJI } from "@/lib/iching";
import type { WeeklySummary as Summary } from "@/lib/gamification";

interface Props {
  summary: Summary;
}

function themeNoun(theme: string, count: number) {
  const suffix = count === 1 ? "Day" : "Days";
  return `${theme} ${suffix}`;
}

export function WeeklySummary({ summary }: Props) {
  const total = summary.themes.reduce((s, t) => s + t.count, 0);
  return (
    <div className="card px-6 py-5 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Your week</p>
        <p className="text-xs text-stone">
          {summary.days === 0 ? "No readings in the last 7 days" : `${summary.days} of 7 days`}
        </p>
      </div>
      {summary.themes.length === 0 ? (
        <p className="mt-3 text-sm text-stone">
          Your weekly energy summary will appear here once you have a few readings.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-charcoal">
            {summary.themes.map((t, i) => (
              <span key={t.theme}>
                {i > 0 && <span className="mx-1.5 text-mist">·</span>}
                <span className="font-medium text-ink">{t.count}</span> {themeNoun(t.theme, t.count)}
              </span>
            ))}
          </p>
          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-cream-deep" aria-hidden>
            {summary.themes.map((t, i) => (
              <span
                key={t.theme}
                className={`h-full ${i % 2 === 0 ? "bg-jade" : "bg-gold"} ${i > 0 ? "border-l border-paper" : ""}`}
                style={{ width: `${(t.count / total) * 100}%`, opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {summary.themes.map((t) => (
              <li key={t.theme} className="flex items-center gap-2 text-charcoal">
                <span className="text-base leading-none" aria-hidden>
                  {THEME_EMOJI[t.theme]}
                </span>
                <span className="truncate">{t.theme}</span>
                <span className="ml-auto flex gap-1" aria-label={`${t.count} days`}>
                  {Array.from({ length: t.count }, (_, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/70" />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
