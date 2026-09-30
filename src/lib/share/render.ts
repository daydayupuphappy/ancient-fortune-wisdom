import { CARD_DISCLAIMER, CARD_HEIGHT, CARD_SITE, CARD_WIDTH, fitFontSize, wrapText, type FortuneCardData } from "./card";
import type { CardPalette } from "./variants";

/** CSS font-family lists used on the card (resolved from the app's next/font variables). */
export interface CardFonts {
  sans: string;
  display: string;
  zh: string;
}

export const FALLBACK_CARD_FONTS: CardFonts = {
  sans: "Inter, system-ui, sans-serif",
  display: "'Cormorant Garamond', Georgia, serif",
  zh: "'Noto Serif SC', 'Songti SC', 'Noto Serif CJK SC', serif",
};

const W = CARD_WIDTH;
const H = CARD_HEIGHT;
const CX = W / 2;

/** Draw text with manual tracking (canvas letterSpacing is not universally supported). */
function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cursor = x - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, cursor, y);
    cursor += widths[i] + tracking;
  });
  ctx.textAlign = align;
  return total;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.12, x + s, y);
  ctx.quadraticCurveTo(x + s * 0.12, y + s * 0.12, x, y + s);
  ctx.quadraticCurveTo(x - s * 0.12, y + s * 0.12, x - s, y);
  ctx.quadraticCurveTo(x - s * 0.12, y - s * 0.12, x, y - s);
  ctx.closePath();
  ctx.fill();
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.fill();
}

function background(ctx: CanvasRenderingContext2D, p: CardPalette) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, p.bgTop);
  bg.addColorStop(1, p.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const top = ctx.createRadialGradient(CX, 520, 0, CX, 520, 760);
  top.addColorStop(0, `rgba(${p.glow}, ${p.glowAlpha})`);
  top.addColorStop(1, `rgba(${p.glow}, 0)`);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H);

  const bottom = ctx.createRadialGradient(W * 0.85, H * 0.92, 0, W * 0.85, H * 0.92, 820);
  bottom.addColorStop(0, `rgba(${p.glowAlt}, ${p.glowAltAlpha})`);
  bottom.addColorStop(1, `rgba(${p.glowAlt}, 0)`);
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = p.frame;
  ctx.lineWidth = 2;
  roundedRect(ctx, 44, 44, W - 88, H - 88, 40);
  ctx.stroke();
}

function hexagramLines(ctx: CanvasRenderingContext2D, data: FortuneCardData, p: CardPalette, top: number) {
  const width = 300;
  const thick = 16;
  const gap = 22;
  const yinGap = 52;
  const left = CX - width / 2;
  // Top line (index 5) is drawn first.
  [...data.lines].reverse().forEach((line, i) => {
    const y = top + i * (thick + gap);
    ctx.fillStyle = p.ink;
    if (line.yang) {
      roundedRect(ctx, left, y, width, thick, thick / 2);
      ctx.fill();
    } else {
      const half = (width - yinGap) / 2;
      roundedRect(ctx, left, y, half, thick, thick / 2);
      ctx.fill();
      roundedRect(ctx, left + half + yinGap, y, half, thick, thick / 2);
      ctx.fill();
    }
    if (line.changing) {
      const mx = left + width + 44;
      const my = y + thick / 2;
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (line.yang) {
        ctx.arc(mx, my, 11, 0, Math.PI * 2);
      } else {
        ctx.moveTo(mx - 10, my - 10);
        ctx.lineTo(mx + 10, my + 10);
        ctx.moveTo(mx + 10, my - 10);
        ctx.lineTo(mx - 10, my + 10);
      }
      ctx.stroke();
    }
  });
  return top + data.lines.length * (thick + gap) - gap;
}

/**
 * Paint the fortune card at logical 1080×1920. Callers scale the context for
 * higher-density output (e.g. `ctx.scale(2, 2)` on a 2160×3840 canvas).
 */
export function drawFortuneCard(
  ctx: CanvasRenderingContext2D,
  data: FortuneCardData,
  palette: CardPalette,
  fonts: CardFonts = FALLBACK_CARD_FONTS,
) {
  const p = palette;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  background(ctx, p);

  // Eyebrow + date
  ctx.fillStyle = p.ink;
  ctx.font = `600 26px ${fonts.sans}`;
  drawTracked(ctx, "FORTUNE TOSS", CX, 172, 9);
  ctx.fillStyle = p.muted;
  ctx.font = `500 46px ${fonts.display}`;
  ctx.fillText(data.date, CX, 240);

  // Score with sparkle
  ctx.font = `500 220px ${fonts.display}`;
  const scoreText = String(data.score);
  const numW = ctx.measureText(scoreText).width;
  const sparkleSize = 38;
  const gapToNum = 34;
  const groupW = sparkleSize * 2 + gapToNum + numW;
  const startX = CX - groupW / 2;
  ctx.fillStyle = p.accent;
  sparkle(ctx, startX + sparkleSize, 352, sparkleSize);
  sparkle(ctx, startX + sparkleSize * 2.1, 294, sparkleSize * 0.42);
  ctx.fillStyle = p.ink;
  ctx.textAlign = "left";
  ctx.fillText(scoreText, startX + sparkleSize * 2 + gapToNum, 445);
  ctx.textAlign = "center";

  ctx.fillStyle = p.accent;
  ctx.font = `600 28px ${fonts.sans}`;
  drawTracked(ctx, data.label.toUpperCase(), CX, 558, 10);

  // Divider
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 90, 614);
  ctx.lineTo(CX - 18, 614);
  ctx.moveTo(CX + 18, 614);
  ctx.lineTo(CX + 90, 614);
  ctx.stroke();
  ctx.fillStyle = p.accent;
  diamond(ctx, CX, 614, 7);

  ctx.fillStyle = p.muted;
  ctx.font = `500 24px ${fonts.sans}`;
  drawTracked(ctx, `HEXAGRAM ${data.hexagramNumber}`, CX, 682, 8);

  // Chinese character inside a thin circle
  const circleY = 878;
  const radius = 172;
  ctx.strokeStyle = p.frame;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CX, circleY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = p.accent;
  diamond(ctx, CX, circleY - radius, 6);

  const glyphs = [...data.chinese].length;
  const zhSize = glyphs > 1 ? 150 : 236;
  ctx.fillStyle = p.ink;
  ctx.font = `600 ${zhSize}px ${fonts.zh}`;
  const zhMetrics = ctx.measureText(data.chinese);
  const ascent = zhMetrics.actualBoundingBoxAscent || zhSize * 0.8;
  const descent = zhMetrics.actualBoundingBoxDescent || zhSize * 0.1;
  ctx.fillText(data.chinese, CX, circleY + (ascent - descent) / 2);

  // English name
  const nameSize = fitFontSize(880, 80, 48, (size) => {
    ctx.font = `500 ${size}px ${fonts.display}`;
    return ctx.measureText(data.english).width;
  });
  ctx.font = `500 ${nameSize}px ${fonts.display}`;
  ctx.fillText(data.english, CX, 1140);

  const linesBottom = hexagramLines(ctx, data, p, 1200);

  // Quote
  ctx.fillStyle = p.ink;
  ctx.font = `italic 400 48px ${fonts.display}`;
  const quoteLines = wrapText(`“${data.quote}”`, 820, (s) => ctx.measureText(s).width, 3);
  const lineHeight = 62;
  const quoteTop = linesBottom + 88;
  quoteLines.forEach((line, i) => ctx.fillText(line, CX, quoteTop + i * lineHeight));

  // Lucky row
  const rowTop = 1645;
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, rowTop);
  ctx.lineTo(W - 140, rowTop);
  ctx.moveTo(CX, rowTop + 30);
  ctx.lineTo(CX, rowTop + 130);
  ctx.stroke();

  const colL = CX - 230;
  const colR = CX + 230;
  ctx.fillStyle = p.muted;
  ctx.font = `600 21px ${fonts.sans}`;
  drawTracked(ctx, "LUCKY COLOR", colL, rowTop + 58, 6);
  drawTracked(ctx, "LUCKY TIME", colR, rowTop + 58, 6);

  ctx.font = `500 52px ${fonts.display}`;
  const colorW = ctx.measureText(data.luckyColor).width;
  const swatchR = 13;
  const swatchGap = 16;
  const colorGroup = swatchR * 2 + swatchGap + colorW;
  const colorStart = colL - colorGroup / 2;
  ctx.fillStyle = data.luckyColorHex;
  ctx.beginPath();
  ctx.arc(colorStart + swatchR, rowTop + 102, swatchR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.muted;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.ink;
  ctx.textAlign = "left";
  ctx.fillText(data.luckyColor, colorStart + swatchR * 2 + swatchGap, rowTop + 118);
  ctx.textAlign = "center";
  ctx.fillText(data.luckyTime, colR, rowTop + 118);

  // Footer
  ctx.fillStyle = p.muted;
  ctx.font = `500 22px ${fonts.sans}`;
  drawTracked(ctx, `${CARD_SITE.toUpperCase()}  ·  ${CARD_DISCLAIMER}`, CX, H - 82, 2);

  ctx.restore();
}

/** Resolve the next/font families from the CSS variables declared on <html>. */
export function resolveCardFonts(root: Element = document.documentElement): CardFonts {
  const style = getComputedStyle(root);
  const read = (name: string, fallback: string) => {
    const value = style.getPropertyValue(name).trim();
    return value ? `${value}, ${fallback}` : fallback;
  };
  return {
    sans: read("--font-inter", FALLBACK_CARD_FONTS.sans),
    display: read("--font-cormorant", FALLBACK_CARD_FONTS.display),
    zh: read("--font-noto-serif-sc", FALLBACK_CARD_FONTS.zh),
  };
}

/** Make sure every face (and the CJK glyph subset) is loaded before painting. */
export async function ensureCardFonts(fonts: CardFonts, data: FortuneCardData): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const sample = `${data.english} ${data.date} ${data.quote} ${data.score} ${data.luckyColor} ${data.luckyTime}`;
  await Promise.allSettled([
    document.fonts.load(`600 26px ${fonts.sans}`, "FORTUNE TOSS"),
    document.fonts.load(`500 26px ${fonts.sans}`, "HEXAGRAM"),
    document.fonts.load(`500 48px ${fonts.display}`, sample),
    document.fonts.load(`italic 400 48px ${fonts.display}`, sample),
    document.fonts.load(`600 200px ${fonts.zh}`, data.chinese),
  ]);
  await document.fonts.ready;
}

/** Render the card to an offscreen canvas at `scale` and encode it as PNG. */
export async function renderCardPng(
  data: FortuneCardData,
  palette: CardPalette,
  fonts: CardFonts,
  scale: number,
): Promise<Blob> {
  await ensureCardFonts(fonts, data);
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  ctx.scale(scale, scale);
  drawFortuneCard(ctx, data, palette, fonts);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))), "image/png"),
  );
}
