"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { hydrateReading, type Reading, type StoredReading } from "@/lib/reading";
import { EXPORT_SCALE, buildCardData, buildShareText, shareFileName } from "@/lib/share/card";
import { renderCardPng, resolveCardFonts, type CardFonts } from "@/lib/share/render";
import { getCardVariant, type CardVariantId } from "@/lib/share/variants";
import { getReading, getTodaysReading } from "@/lib/storage";
import { FortuneCardCanvas } from "./FortuneCardCanvas";
import { VariantSwitcher } from "./VariantSwitcher";

function subscribe(onChange: () => void) {
  window.addEventListener("afw:readings-changed", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("afw:readings-changed", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function toStored(r: Reading): StoredReading {
  const { id, createdAt, dateKey, lineValues, question, interpretation } = r;
  return { id, createdAt, dateKey, lineValues, question, interpretation };
}

/** Serialized snapshot (stable string) of the reading to share; "" when none, null on the server. */
function useShareReading(id: string | undefined): Reading | null | undefined {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const r = id ? getReading(id) : getTodaysReading();
      return r ? JSON.stringify(toStored(r)) : "";
    },
    () => null,
  );
  return useMemo(() => {
    if (snapshot === null) return undefined;
    if (snapshot === "") return null;
    return hydrateReading(JSON.parse(snapshot) as StoredReading);
  }, [snapshot]);
}

function subscribeFonts(onChange: () => void) {
  document.fonts?.addEventListener("loadingdone", onChange);
  return () => document.fonts?.removeEventListener("loadingdone", onChange);
}

function useCardFonts(): CardFonts | null {
  const key = useSyncExternalStore(
    subscribeFonts,
    () => JSON.stringify(resolveCardFonts()),
    () => null,
  );
  return useMemo(() => (key ? (JSON.parse(key) as CardFonts) : null), [key]);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function ShareStudio({ readingId }: { readingId?: string }) {
  const reading = useShareReading(readingId);
  const fonts = useCardFonts();
  const [variantId, setVariantId] = useState<CardVariantId>("light");
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [status, setStatus] = useState<string>("");

  const data = useMemo(() => (reading ? buildCardData(reading) : null), [reading]);
  const variant = getCardVariant(variantId);

  // Pre-render the export so Share can call navigator.share while the click's user activation is still fresh.
  const pngCache = useRef(new Map<string, Promise<Blob>>());
  const pngFor = (id: CardVariantId): Promise<Blob> | null => {
    if (!data || !fonts) return null;
    const key = `${JSON.stringify(data)}:${id}`;
    let png = pngCache.current.get(key);
    if (!png) {
      png = renderCardPng(data, getCardVariant(id).palette, fonts, EXPORT_SCALE);
      png.catch(() => pngCache.current.delete(key));
      pngCache.current.set(key, png);
    }
    return png;
  };
  const pngForRef = useRef(pngFor);
  useEffect(() => {
    pngForRef.current = pngFor;
  });
  useEffect(() => {
    if (!data || !fonts) return;
    const t = setTimeout(() => pngForRef.current(variantId), 400);
    return () => clearTimeout(t);
  }, [data, fonts, variantId]);

  if (reading === undefined || !fonts) {
    return <div className="mx-auto min-h-[70vh] max-w-5xl" aria-busy="true" />;
  }

  if (!reading || !data) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center fade-up">
        <span className="zh flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 text-2xl text-ink">
          卦
        </span>
        <p className="eyebrow mt-8">Share card</p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">
          {readingId ? "That reading isn't on this device" : "Toss first, then share"}
        </h1>
        <p className="mt-4 text-charcoal/80">
          Your fortune card is made from a reading. Six tosses of three coins create today&apos;s hexagram.
        </p>
        <Link href="/" className="btn-primary mt-10">
          Toss my fortune
        </Link>
      </section>
    );
  }

  const fileName = shareFileName(data, reading.dateKey);
  const text = buildShareText(data);

  const render = () => pngFor(variantId) ?? Promise.reject(new Error("Card not ready"));

  async function onDownload() {
    setBusy("download");
    setStatus("");
    try {
      downloadBlob(await render(), fileName);
      setStatus("Saved your card as a PNG.");
    } catch {
      setStatus("Couldn't create the image. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    setBusy("share");
    setStatus("");
    try {
      const blob = await render();
      const file = new File([blob], fileName, { type: "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Fortune Toss", text });
          setStatus("Shared.");
        } catch (err) {
          if ((err as DOMException).name !== "AbortError") throw err;
        }
        return;
      }
      downloadBlob(blob, fileName);
      try {
        await navigator.clipboard.writeText(text);
        setStatus("Card downloaded and summary copied — paste it alongside the image.");
      } catch {
        setStatus("Card downloaded. Sharing isn't supported in this browser.");
      }
    } catch {
      setStatus("Couldn't share the image. Try Download PNG instead.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-12 fade-up md:grid-cols-[minmax(0,420px)_1fr] md:gap-16 md:py-16">
      <div className="mx-auto w-full max-w-[340px] md:max-w-[420px]">
        <FortuneCardCanvas data={data} palette={variant.palette} fonts={fonts} />
      </div>

      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <p className="eyebrow">Share card</p>
        <h1 className="display mt-3 text-4xl leading-tight text-ink sm:text-5xl">
          Hexagram {data.hexagramNumber} · <span className="zh">{data.chinese}</span> {data.english}
        </h1>
        <p className="mt-4 max-w-md text-charcoal/80">
          A small keepsake of today&apos;s reflection. Choose a style, then save it or send it to someone.
        </p>

        <div className="mt-8">
          <p className="eyebrow mb-3">Style</p>
          <VariantSwitcher value={variantId} onChange={setVariantId} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <button type="button" className="btn-primary disabled:opacity-60" onClick={onDownload} disabled={!!busy}>
            {busy === "download" ? "Preparing…" : "Download PNG"}
          </button>
          <button type="button" className="btn-secondary disabled:opacity-60" onClick={onShare} disabled={!!busy}>
            {busy === "share" ? "Preparing…" : "Share"}
          </button>
        </div>

        <p className="mt-4 min-h-5 text-sm text-jade" role="status" aria-live="polite">
          {status}
        </p>

        <p className="mt-6 text-xs text-stone">
          9:16 portrait, exported at 2× (2160 × 3840) — looks great on Instagram Stories, WhatsApp, X, LinkedIn, WeChat.
        </p>
        <p className="mt-2 text-xs text-stone">For reflection, not prediction.</p>
      </div>
    </section>
  );
}
