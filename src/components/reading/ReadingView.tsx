"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Reading } from "@/lib/reading";
import { getReading, getTodaysReading } from "@/lib/storage";
import { EnergyRing } from "./EnergyRing";
import { ExploreSection } from "./ExploreSection";
import { AttributesGrid, FavorsAvoid, Reflection } from "./Guidance";
import { HexagramCard } from "./HexagramCard";
import { Interpretation } from "./Interpretation";

type State = { status: "loading" } | { status: "empty" } | { status: "ready"; reading: Reading };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function ReadingView() {
  const params = useSearchParams();
  const id = params.get("id");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const load = () => {
      const reading = (id ? getReading(id) : undefined) ?? (id ? undefined : getTodaysReading());
      setState(reading ? { status: "ready", reading } : { status: "empty" });
    };
    load();
    window.addEventListener("afw:readings-changed", load);
    return () => window.removeEventListener("afw:readings-changed", load);
  }, [id]);

  if (state.status === "loading") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="skeleton h-40 w-full rounded-[var(--radius-card)]" />
      </section>
    );
  }

  if (state.status === "empty") {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center fade-up">
        <span className="zh text-6xl text-ink/70" aria-hidden>
          易
        </span>
        <p className="eyebrow mt-6">No reading yet</p>
        <h1 className="display mt-3 text-4xl text-ink">Toss first, then read.</h1>
        <p className="mt-4 max-w-sm text-charcoal/80">
          {id ? "We couldn't find that reading on this device." : "Today's hexagram is waiting for six tosses."}
        </p>
        <Link href="/" className="btn-primary mt-8">
          Toss my fortune
        </Link>
      </section>
    );
  }

  const { reading } = state;
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5 px-6 pb-24 pt-12 fade-up sm:gap-6">
      <header className="text-center">
        <p className="eyebrow">Your reading · {formatDate(reading.createdAt)}</p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">Today&apos;s energy</h1>
      </header>

      <EnergyRing energy={reading.energy} />
      <HexagramCard cast={reading.cast} />
      <Interpretation reading={reading} />
      <FavorsAvoid energy={reading.energy} />
      <AttributesGrid energy={reading.energy} />
      <Reflection energy={reading.energy} />
      <ExploreSection hexagram={reading.cast.primary} />

      <nav className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" aria-label="Next steps">
        <Link href={`/oracle?id=${reading.id}`} className="btn-primary w-full sm:w-auto">
          Ask the Oracle
        </Link>
        <Link href={`/share?id=${reading.id}`} className="btn-secondary w-full sm:w-auto">
          Share
        </Link>
        <Link href="/" className="btn-secondary w-full sm:w-auto">
          Toss again
        </Link>
      </nav>
    </section>
  );
}
