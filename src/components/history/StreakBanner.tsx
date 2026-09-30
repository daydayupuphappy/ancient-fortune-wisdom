interface Props {
  streak: number;
}

export function StreakBanner({ streak }: Props) {
  const active = streak > 0;
  return (
    <div className="card flex items-center gap-5 px-6 py-5 sm:px-8">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl ${
          active ? "bg-gold-soft/60" : "bg-cream-deep"
        }`}
        aria-hidden
      >
        {active ? "🔥" : "🌱"}
      </span>
      <div>
        <p className="eyebrow">{active ? "Daily streak" : "Start your streak"}</p>
        <p className="display mt-1 text-2xl leading-tight text-ink sm:text-3xl">
          {active ? `${streak}-Day Streak` : "Every journey begins with one toss"}
        </p>
        <p className="mt-1 text-sm text-stone">
          {active
            ? `You've reflected for ${streak} ${streak === 1 ? "day" : "days"}.`
            : "Toss today and come back tomorrow to begin a streak."}
        </p>
      </div>
    </div>
  );
}
