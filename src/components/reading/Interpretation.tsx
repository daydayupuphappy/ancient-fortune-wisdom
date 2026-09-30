"use client";

import { useEffect, useState } from "react";
import type { Reading } from "@/lib/reading";
import { loadReadings, upsertReading } from "@/lib/storage";
import { recentHistory } from "@/lib/toss/sequence";

export function Interpretation({ reading }: { reading: Reading }) {
  const [fetched, setFetched] = useState<{ id: string; text?: string; error?: boolean }>();
  const text = reading.interpretation ?? (fetched?.id === reading.id ? fetched.text : undefined);
  const error = fetched?.id === reading.id && fetched.error;

  useEffect(() => {
    if (reading.interpretation) return;
    let cancelled = false;
    const history = recentHistory(loadReadings(), reading.id);
    fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineValues: reading.lineValues, date: reading.createdAt, history }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((data: { text: string }) => {
        if (cancelled) return;
        setFetched({ id: reading.id, text: data.text });
        const { cast, energy, ...stored } = reading;
        void cast;
        void energy;
        upsertReading({ ...stored, interpretation: data.text });
      })
      .catch(() => {
        if (!cancelled) setFetched({ id: reading.id, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [reading]);

  return (
    <div className="card px-6 py-8 sm:px-10">
      <p className="eyebrow">Today&apos;s message</p>
      {text ? (
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-charcoal">
          {text.split(/\n{2,}/).map((para, i) => (
            <p key={i} lang="en" className="[font-family:var(--font-inter),var(--font-noto-serif-sc),system-ui,sans-serif]">
              {para}
            </p>
          ))}
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-stone">The oracle is quiet for a moment. Refresh to try again.</p>
      ) : (
        <div className="mt-5 space-y-3" aria-busy aria-label="Loading interpretation">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton mt-6 h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      )}
    </div>
  );
}
