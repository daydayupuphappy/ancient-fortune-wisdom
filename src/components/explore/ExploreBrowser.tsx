"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HEXAGRAMS, TRIGRAMS, TRIGRAM_LIST, type TrigramKey } from "@/lib/iching";
import { filterHexagrams, hexagramFor, isTrigramKey } from "@/lib/explore";
import { HexagramTile } from "./HexagramTile";
import { TrigramGlyph } from "./TrigramCard";

type View = "grid" | "matrix";

function TrigramSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: TrigramKey | null;
  onChange: (v: TrigramKey | null) => void;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(isTrigramKey(e.target.value) ? e.target.value : null)}
        className="rounded-full border border-mist bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
      >
        <option value="">Any trigram</option>
        {TRIGRAM_LIST.map((t) => (
          <option key={t.key} value={t.key}>
            {t.chinese} {t.english}
          </option>
        ))}
      </select>
    </label>
  );
}

interface BrowserState {
  query: string;
  upper: TrigramKey | null;
  lower: TrigramKey | null;
  view: View;
}

function stateFromParams(params: URLSearchParams): BrowserState {
  const u = params.get("upper");
  const l = params.get("lower");
  return {
    query: params.get("q") ?? "",
    upper: isTrigramKey(u) ? u : null,
    lower: isTrigramKey(l) ? l : null,
    view: params.get("view") === "matrix" ? "matrix" : "grid",
  };
}

function paramsFromState(s: BrowserState): string {
  const next = new URLSearchParams();
  if (s.query.trim()) next.set("q", s.query.trim());
  if (s.upper) next.set("upper", s.upper);
  if (s.lower) next.set("lower", s.lower);
  if (s.view === "matrix") next.set("view", "matrix");
  return next.toString();
}

export function ExploreBrowser() {
  const params = useSearchParams();
  const paramsKey = params.toString();
  const [state, setState] = useState<BrowserState>(() => stateFromParams(params));
  const [seenParams, setSeenParams] = useState(paramsKey);
  const { query, upper, lower, view } = state;

  // The URL changed underneath us (e.g. a trigram card link on this same page): adopt it,
  // unless it is just the echo of what we wrote ourselves in the effect below.
  if (paramsKey !== seenParams) {
    setSeenParams(paramsKey);
    if (paramsKey !== paramsFromState(state)) setState(stateFromParams(params));
  }

  useEffect(() => {
    const qs = paramsFromState(state);
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [state]);

  const setQuery = (query: string) => setState((s) => ({ ...s, query }));
  const setUpper = (upper: TrigramKey | null) => setState((s) => ({ ...s, upper }));
  const setLower = (lower: TrigramKey | null) => setState((s) => ({ ...s, lower }));
  const setView = (view: View) => setState((s) => ({ ...s, view }));

  const results = useMemo(() => filterHexagrams({ query, upper, lower }), [query, upper, lower]);
  const hasFilter = Boolean(query.trim() || upper || lower);

  function reset() {
    setState((s) => ({ ...s, query: "", upper: null, lower: null }));
  }

  return (
    <div id="hexagrams" className="scroll-mt-24">
      <div className="card flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label htmlFor="explore-search" className="flex flex-1 flex-col gap-1.5">
            <span className="eyebrow">Search</span>
            <input
              id="explore-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Number, 乾, qian, Creative, patience…"
              className="w-full rounded-full border border-mist bg-paper px-5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone/70 focus:border-gold"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <TrigramSelect id="explore-upper" label="Upper trigram" value={upper} onChange={setUpper} />
            <TrigramSelect id="explore-lower" label="Lower trigram" value={lower} onChange={setLower} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mist pt-4">
          <p className="text-sm text-stone">
            {view === "grid" ? (
              <>
                Showing <span className="font-medium text-ink">{results.length}</span> of 64 hexagrams
              </>
            ) : (
              <>Upper trigram across, lower trigram down</>
            )}
            {hasFilter && (
              <>
                {" · "}
                <button type="button" onClick={reset} className="underline decoration-gold/60 underline-offset-4 hover:text-ink">
                  Clear filters
                </button>
              </>
            )}
          </p>
          <div role="tablist" aria-label="Layout" className="flex rounded-full border border-mist bg-cream p-1 text-xs">
            {(["grid", "matrix"] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 font-medium capitalize transition ${
                  view === v ? "bg-ink text-cream" : "text-charcoal hover:text-ink"
                }`}
              >
                {v === "grid" ? "Grid" : "8 × 8 Matrix"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "grid" ? (
        results.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
            {results.map((h, i) => (
              <li key={h.number} className="flex">
                <HexagramTile hexagram={h} style={{ animationDelay: `${Math.min(i, 24) * 20}ms` }} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mt-8 px-6 py-16 text-center">
            <span className="zh text-4xl text-stone/70">无</span>
            <p className="mt-4 text-charcoal">No hexagram matches that search.</p>
            <button type="button" onClick={reset} className="btn-secondary mt-6">
              Clear filters
            </button>
          </div>
        )
      ) : (
        <Matrix highlightUpper={upper} highlightLower={lower} />
      )}
    </div>
  );
}

function Matrix({ highlightUpper, highlightLower }: { highlightUpper: TrigramKey | null; highlightLower: TrigramKey | null }) {
  const keys = TRIGRAM_LIST.map((t) => t.key);
  const filtering = Boolean(highlightUpper || highlightLower);
  return (
    <div className="mt-8 overflow-x-auto pb-2">
      <table className="w-full min-w-[640px] border-separate border-spacing-1.5 text-center">
        <thead>
          <tr>
            <th className="p-2 text-left align-bottom">
              <span className="eyebrow">Upper →</span>
              <br />
              <span className="eyebrow">Lower ↓</span>
            </th>
            {keys.map((k) => (
              <th key={k} scope="col" className="p-2 align-bottom">
                <div className="flex flex-col items-center gap-1.5">
                  <TrigramGlyph lines={TRIGRAMS[k].lines} size="sm" />
                  <span className="zh text-lg text-ink">{TRIGRAMS[k].chinese}</span>
                  <span className="text-[10px] uppercase tracking-wider text-stone">{TRIGRAMS[k].english}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((lowerKey) => (
            <tr key={lowerKey}>
              <th scope="row" className="p-2 text-left">
                <div className="flex items-center gap-3">
                  <TrigramGlyph lines={TRIGRAMS[lowerKey].lines} size="sm" />
                  <div>
                    <span className="zh text-lg text-ink">{TRIGRAMS[lowerKey].chinese}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-stone">{TRIGRAMS[lowerKey].english}</span>
                  </div>
                </div>
              </th>
              {keys.map((upperKey) => {
                const h = hexagramFor(upperKey, lowerKey);
                const dim =
                  filtering &&
                  ((highlightUpper && highlightUpper !== upperKey) || (highlightLower && highlightLower !== lowerKey));
                return (
                  <td key={upperKey} className="p-0">
                    <Link
                      href={`/explore/${h.number}`}
                      title={`${h.number} · ${h.chinese} ${h.english}`}
                      className={`card flex flex-col items-center gap-1 rounded-2xl px-2 py-3 transition hover:-translate-y-0.5 hover:border-gold/70 ${
                        dim ? "opacity-30" : ""
                      }`}
                    >
                      <span className="text-[10px] text-stone">{h.number}</span>
                      <span className="zh text-xl leading-none text-ink">{h.chinese}</span>
                      <span className="max-w-[5.5rem] truncate text-[10px] text-charcoal">{h.english}</span>
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-center text-xs text-stone">
        {HEXAGRAMS.length} hexagrams · each square pairs one lower trigram with one upper trigram.
      </p>
    </div>
  );
}
