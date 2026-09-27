"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BadgeRow } from "@/components/history/BadgeRow";
import { ReadingRow } from "@/components/history/ReadingRow";
import { SeedDemoButton } from "@/components/history/SeedDemoButton";
import { StreakBanner } from "@/components/history/StreakBanner";
import { WeeklySummary } from "@/components/history/WeeklySummary";
import { useReadings } from "@/components/history/useReadings";
import { computeBadges, groupByMonth, weeklySummary } from "@/lib/gamification";
import { computeStreak } from "@/lib/storage";

export default function HistoryPage() {
  const { readings, loaded } = useReadings();
  const stats = useMemo(() => {
    const now = new Date();
    return {
      streak: computeStreak(readings, now),
      week: weeklySummary(readings, now),
      badges: computeBadges(readings, now),
      months: groupByMonth(readings, now),
    };
  }, [readings]);

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-14 fade-up">
      <header className="text-center">
        <p className="eyebrow">Fortune history</p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
          Your readings <span className="zh ml-2 text-3xl text-stone sm:text-4xl">历</span>
        </h1>
        <p className="mt-3 text-stone">Every toss you have reflected on, kept in one quiet place.</p>
      </header>

      {!loaded ? null : readings.length === 0 ? (
        <div className="mt-12 space-y-6">
          <StreakBanner streak={0} />
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <span className="zh text-5xl text-gold" aria-hidden>
              易
            </span>
            <h2 className="display mt-5 text-3xl text-ink">No readings yet</h2>
            <p className="mt-3 max-w-sm text-stone">
              Your history fills in as you toss. Each reading becomes a small marker of where your attention was that
              day.
            </p>
            <Link href="/" className="btn-primary mt-8">
              Toss first
            </Link>
          </div>
          <BadgeRow badges={stats.badges} />
          <SeedDemoButton />
        </div>
      ) : (
        <div className="mt-12 space-y-6">
          <StreakBanner streak={stats.streak} />
          <WeeklySummary summary={stats.week} />
          <BadgeRow badges={stats.badges} />

          <div className="space-y-10 pt-6">
            {stats.months.map((m) => (
              <section key={m.key}>
                <div className="flex items-baseline justify-between px-3 sm:px-4">
                  <h2 className="display text-2xl text-ink">{m.label}</h2>
                  <span className="text-xs text-stone">
                    {m.readings.length} {m.readings.length === 1 ? "reading" : "readings"}
                  </span>
                </div>
                <ul className="card mt-3 divide-y divide-mist/60 p-2">
                  {m.readings.map((r) => (
                    <ReadingRow key={r.id} reading={r} />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="pt-6 text-center text-xs text-stone">
            Readings are symbolic prompts for reflection, not predictions.
          </p>
          <SeedDemoButton />
        </div>
      )}
    </section>
  );
}
