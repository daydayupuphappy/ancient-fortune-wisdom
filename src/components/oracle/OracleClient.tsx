"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Reading } from "@/lib/reading";
import { getReading, getTodaysReading, loadReadings, upsertReading } from "@/lib/storage";
import { appendExchange, buildHistory, toStoredReading } from "@/lib/oracle/history";
import { OracleComposer } from "./OracleComposer";
import { OracleThread } from "./OracleThread";
import { ReadingSummaryCard } from "./ReadingSummaryCard";
import { TossAgainLink } from "./TossAgainLink";

type State = { status: "loading" } | { status: "empty" } | { status: "ready"; reading: Reading };

function resolveReading(id: string | null): Reading | undefined {
  if (id) return getReading(id);
  return getTodaysReading() ?? loadReadings()[0];
}

export function OracleClient() {
  const params = useSearchParams();
  const id = params.get("id");
  const [state, setState] = useState<State>({ status: "loading" });
  const [pending, setPending] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [lastFailed, setLastFailed] = useState<string | undefined>();

  useEffect(() => {
    const refresh = () => {
      const reading = resolveReading(id);
      setState(reading ? { status: "ready", reading } : { status: "empty" });
    };
    refresh();
    window.addEventListener("afw:readings-changed", refresh);
    return () => window.removeEventListener("afw:readings-changed", refresh);
  }, [id]);

  const ask = useCallback(
    async (question: string) => {
      if (state.status !== "ready" || pending) return;
      const { reading } = state;
      setError(undefined);
      setLastFailed(undefined);
      setPending(question);
      try {
        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lineValues: reading.lineValues,
            date: reading.createdAt,
            question,
            history: buildHistory(loadReadings(), reading.id),
          }),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const { text } = (await res.json()) as { text: string };
        const latest = getReading(reading.id) ?? reading;
        upsertReading(appendExchange(toStoredReading(latest), { question, answer: text, askedAt: new Date().toISOString() }));
      } catch {
        setError("The Oracle could not be reached just now. Your question was not lost — try again in a moment.");
        setLastFailed(question);
      } finally {
        setPending(undefined);
      }
    },
    [state, pending],
  );

  if (state.status === "loading") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="eyebrow">Ask the Oracle</p>
      </section>
    );
  }

  if (state.status === "empty") {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center fade-up">
        <p className="eyebrow">Ask the Oracle</p>
        <p className="zh mt-8 text-6xl text-ink/90">問</p>
        <h1 className="display mt-6 text-4xl text-ink">Toss first</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-stone">
          The Oracle reflects on a hexagram you have already cast. Toss the coins, then return here to ask
          your question.
        </p>
        <Link href="/" className="btn-primary mt-10">
          Toss the coins
        </Link>
      </section>
    );
  }

  const { reading } = state;
  const exchanges = reading.oracle ?? [];

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-10 px-6 pt-10 pb-24">
      <header className="fade-up">
        <p className="eyebrow">Ask the Oracle</p>
        <h1 className="display mt-2 text-3xl text-ink sm:text-4xl">
          Reflect on this reading <span className="zh ml-2 text-2xl text-gold sm:text-3xl">問卦</span>
        </h1>
      </header>

      <ReadingSummaryCard reading={reading} />

      <OracleThread
        exchanges={exchanges}
        pendingQuestion={pending}
        error={error}
        lines={reading.cast.lines}
        onRetry={lastFailed ? () => ask(lastFailed) : undefined}
      />

      <div className="flex flex-col gap-4">
        {exchanges.length === 0 && !pending && (
          <p className="text-center text-sm text-stone">
            Ask anything you are weighing. The Oracle answers from this hexagram only — it never casts a new one.
          </p>
        )}
        <OracleComposer disabled={Boolean(pending)} onAsk={ask} />
      </div>

      <footer className="flex flex-col items-center gap-5 border-t border-mist/70 pt-8 text-center">
        <TossAgainLink />
        <p className="text-xs tracking-wide text-stone">The Oracle offers perspective, not predictions.</p>
      </footer>
    </section>
  );
}
