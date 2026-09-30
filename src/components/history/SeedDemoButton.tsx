"use client";

import { castHexagram, seededRng } from "@/lib/iching";
import { newStoredReading } from "@/lib/reading";
import { loadStoredReadings, saveStoredReadings } from "@/lib/storage";

const DEMO_DAYS = 14;

/** Dev-only: seeds two weeks of deterministic readings so the UI can be demoed. */
export function SeedDemoButton() {
  if (process.env.NODE_ENV === "production") return null;

  const seed = () => {
    const now = new Date();
    const existing = loadStoredReadings();
    const taken = new Set(existing.map((r) => r.dateKey));
    const seeded = Array.from({ length: DEMO_DAYS }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(9 + (i % 5), 15 + i, 0, 0);
      return newStoredReading(castHexagram(seededRng(1000 + i)), undefined, d);
    }).filter((r) => !taken.has(r.dateKey));
    saveStoredReadings([...existing, ...seeded]);
  };

  const clear = () => saveStoredReadings([]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone">
      <span className="eyebrow">Dev</span>
      <button type="button" onClick={seed} className="rounded-full border border-mist px-3 py-1 hover:border-gold">
        Seed demo history
      </button>
      <button type="button" onClick={clear} className="rounded-full border border-mist px-3 py-1 hover:border-vermilion">
        Clear history
      </button>
    </div>
  );
}
