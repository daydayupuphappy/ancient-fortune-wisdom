import { THEME_EMOJI, type DailyEnergy } from "@/lib/iching";

const R = 54;
const CIRC = 2 * Math.PI * R;

export function EnergyRing({ energy }: { energy: DailyEnergy }) {
  const offset = CIRC * (1 - energy.score / 100);
  return (
    <div className="card flex flex-col items-center px-8 py-8 text-center sm:flex-row sm:gap-8 sm:text-left">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="var(--mist)" strokeWidth="6" />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            className="ring-progress"
            style={{ "--ring-total": CIRC } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="display text-4xl leading-none text-ink">{energy.score}</span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone">/ 100</span>
        </div>
      </div>
      <div className="mt-5 sm:mt-0">
        <p className="eyebrow">Daily energy</p>
        <p className="display mt-2 text-3xl text-ink">
          <span aria-hidden>{THEME_EMOJI[energy.theme]}</span> {energy.label}
        </p>
        <p className="mt-2 text-sm text-charcoal/80">
          Theme: <span className="font-medium text-ink">{energy.theme}</span> · Focus:{" "}
          <span className="font-medium text-ink">{energy.focus}</span>
        </p>
        <p className="mt-3 text-xs italic text-stone">A playful reflection, not a prediction.</p>
      </div>
    </div>
  );
}
