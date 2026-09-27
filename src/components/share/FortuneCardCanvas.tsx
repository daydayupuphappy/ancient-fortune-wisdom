"use client";

import { useEffect, useRef } from "react";
import { CARD_HEIGHT, CARD_WIDTH, buildShareText, type FortuneCardData } from "@/lib/share/card";
import { drawFortuneCard, ensureCardFonts, type CardFonts } from "@/lib/share/render";
import type { CardPalette } from "@/lib/share/variants";

interface Props {
  data: FortuneCardData;
  palette: CardPalette;
  fonts: CardFonts;
  className?: string;
}

/** Live preview: the exact same painter as the PNG export, displayed scaled down. */
export function FortuneCardCanvas({ data, palette, fonts, className = "" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    ensureCardFonts(fonts, data).then(() => {
      if (cancelled) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const scale = Math.max(0.5, (canvas.clientWidth * dpr) / CARD_WIDTH);
      canvas.width = Math.round(CARD_WIDTH * scale);
      canvas.height = Math.round(CARD_HEIGHT * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawFortuneCard(ctx, data, palette, fonts);
      canvas.dataset.ready = "true";
    });
    return () => {
      cancelled = true;
    };
  }, [data, palette, fonts]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Fortune card: ${buildShareText(data)}`}
      className={`aspect-[9/16] w-full rounded-[1.75rem] bg-paper opacity-0 shadow-soft transition-opacity duration-500 data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
