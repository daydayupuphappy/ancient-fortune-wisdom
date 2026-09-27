"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexagramLines } from "@/components/HexagramLines";
import { resolveCast, type TossLine } from "@/lib/iching";
import { newStoredReading } from "@/lib/reading";
import { getTodaysReading, upsertReading } from "@/lib/storage";
import { buildTossSequence, COIN_FACE_LABEL, LINE_VALUE_LABEL, TOSS_TIMING } from "@/lib/toss/sequence";
import { Coin } from "./Coin";

type Phase = "idle" | "flip" | "settle" | "done";

interface TossState {
  phase: Phase;
  lines: TossLine[];
  /** Index of the line currently being tossed (0 = bottom). */
  current: number;
}

const IDLE: TossState = { phase: "idle", lines: [], current: -1 };

export function TossExperience() {
  const router = useRouter();
  const [state, setState] = useState<TossState>(IDLE);
  const [todaysId, setTodaysId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refresh = () => setTodaysId(getTodaysReading()?.id ?? null);
    refresh();
    window.addEventListener("afw:readings-changed", refresh);
    return () => window.removeEventListener("afw:readings-changed", refresh);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const finish = useCallback(
    (lines: TossLine[]) => {
      if (timer.current) clearTimeout(timer.current);
      const stored = newStoredReading(resolveCast(lines));
      upsertReading(stored);
      setState({ phase: "done", lines, current: 5 });
      router.push(`/reading?id=${stored.id}`);
    },
    [router],
  );

  useEffect(() => {
    if (state.phase !== "flip" && state.phase !== "settle") return;
    const delay = state.phase === "flip" ? TOSS_TIMING.flip : TOSS_TIMING.settle;
    timer.current = setTimeout(() => {
      if (state.phase === "flip") {
        setState((s) => ({ ...s, phase: "settle" }));
      } else if (state.current >= 5) {
        finish(state.lines);
      } else {
        setState((s) => ({ ...s, phase: "flip", current: s.current + 1 }));
      }
    }, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [state, finish]);

  const start = () => {
    const { lines } = buildTossSequence();
    setState({ phase: "flip", lines, current: 0 });
  };

  const tossing = state.phase === "flip" || state.phase === "settle";
  const line = state.current >= 0 ? state.lines[state.current] : undefined;
  const revealed = state.phase === "settle" || state.phase === "done" ? state.current + 1 : Math.max(0, state.current);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative my-12 flex min-h-[7rem] items-center gap-5 sm:gap-8">
        {[0, 1, 2].map((i) => (
          <Coin
            key={`${state.current}-${i}`}
            idle={state.phase === "idle"}
            flipping={state.phase === "flip"}
            face={state.phase === "settle" || state.phase === "done" ? line?.coins[i] : undefined}
            delayMs={i * 70}
          />
        ))}
      </div>

      {state.phase === "idle" && (
        <>
          <button type="button" onClick={start} className="btn-primary">
            Toss my fortune
          </button>
          {todaysId && (
            <Link href={`/reading?id=${todaysId}`} className="btn-secondary mt-3">
              View today&apos;s reading
            </Link>
          )}
          <p className="mt-6 text-sm text-stone">Six tosses. One hexagram. A new perspective.</p>
        </>
      )}

      {state.phase !== "idle" && (
        <div className="flex w-full flex-col items-center fade-up" aria-live="polite">
          <p className="eyebrow">
            {state.phase === "done" ? "Your hexagram" : `Toss ${state.current + 1} of 6`}
          </p>
          <div className="mt-3 flex h-14 flex-col items-center justify-center">
            {line && state.phase !== "flip" ? (
              <>
                <p className="text-sm text-charcoal/80">
                  {line.coins.map((c) => COIN_FACE_LABEL[c]).join(" · ")}
                </p>
                <p className="display mt-1 text-2xl text-ink">
                  {line.value} <span className="text-base text-stone">— {LINE_VALUE_LABEL[line.value]}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-stone">Coins in the air…</p>
            )}
          </div>

          <HexagramLines lines={state.lines} size="lg" revealed={revealed} className="mt-8" />

          <div className="mt-10 h-10">
            {tossing && (
              <button
                type="button"
                onClick={() => finish(state.lines)}
                className="text-xs uppercase tracking-[0.18em] text-stone transition hover:text-ink"
              >
                Skip animation
              </button>
            )}
            {state.phase === "done" && <p className="text-sm text-stone">Opening your reading…</p>}
          </div>
        </div>
      )}
    </div>
  );
}
