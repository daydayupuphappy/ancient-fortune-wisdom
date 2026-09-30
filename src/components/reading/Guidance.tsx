import type { DailyEnergy } from "@/lib/iching";

export function FavorsAvoid({ energy }: { energy: DailyEnergy }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card px-6 py-6">
        <p className="eyebrow text-jade">Today may favor</p>
        <ul className="mt-4 space-y-2 text-sm text-charcoal">
          {energy.favors.map((f) => (
            <li key={f} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-jade" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="card px-6 py-6">
        <p className="eyebrow text-vermilion/80">Consider avoiding</p>
        <ul className="mt-4 space-y-2 text-sm text-charcoal">
          {energy.avoid.map((a) => (
            <li key={a} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vermilion/70" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AttributesGrid({ energy }: { energy: DailyEnergy }) {
  const items: [string, string][] = [
    ["Lucky color", energy.luckyColor],
    ["Lucky number", String(energy.luckyNumber)],
    ["Direction", energy.luckyDirection],
    ["Element", energy.luckyElement],
    ["Energy window", energy.luckyWindow],
    ["Focus", energy.focus],
  ];
  return (
    <div className="card px-6 py-6 sm:px-8">
      <p className="eyebrow">Symbolic attributes</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        {items.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-stone">{k}</dt>
            <dd className="display mt-1 text-xl text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Reflection({ energy }: { energy: DailyEnergy }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-gold/40 bg-gold-soft/30 px-6 py-8 text-center sm:px-10">
      <p className="eyebrow">Reflection</p>
      <p className="display mt-3 text-2xl leading-snug text-ink sm:text-3xl">{energy.reflection}</p>
    </div>
  );
}
