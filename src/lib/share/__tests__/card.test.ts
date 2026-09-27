import { describe, expect, it } from "vitest";
import { hydrateReading, type StoredReading } from "../../reading";
import {
  LUCKY_COLOR_HEX,
  buildCardData,
  buildShareText,
  firstSentence,
  fitFontSize,
  formatCardDate,
  formatLuckyTime,
  pickQuote,
  shareFileName,
  wrapText,
} from "../card";
import { CARD_VARIANTS, getCardVariant } from "../variants";

const charWidth = (s: string) => s.length * 10;

describe("formatCardDate", () => {
  it("formats month and day", () => {
    expect(formatCardDate(new Date(2026, 8, 27))).toBe("September 27");
    expect(formatCardDate(new Date(2026, 0, 3))).toBe("January 3");
  });
});

describe("firstSentence / pickQuote", () => {
  it("returns the first sentence", () => {
    expect(
      firstSentence(
        "Momentum comes through consistent action rather than force. A small step taken with intention may matter more.",
      ),
    ).toBe("Momentum comes through consistent action rather than force.");
  });

  it("returns the whole text when there is no terminator", () => {
    expect(firstSentence("  A quiet   moment ")).toBe("A quiet moment");
  });

  it("does not split on decimals inside a sentence", () => {
    expect(firstSentence("Version 1.5 is calm. Next.")).toBe("Version 1.5 is calm.");
  });

  it("falls back to the reflection question", () => {
    expect(pickQuote(undefined, "What would restore you today?")).toBe("What would restore you today?");
    expect(pickQuote("   ", "What would restore you today?")).toBe("What would restore you today?");
    expect(pickQuote("Be still. Then move.", "Q?")).toBe("Be still.");
  });
});

describe("formatLuckyTime", () => {
  it("collapses a same-period window", () => {
    expect(formatLuckyTime("4:00 PM – 6:00 PM")).toBe("4–6 PM");
    expect(formatLuckyTime("6:00 AM – 8:00 AM")).toBe("6–8 AM");
  });

  it("keeps both periods when they differ", () => {
    expect(formatLuckyTime("10:00 AM – 12:00 PM")).toBe("10 AM–12 PM");
  });

  it("keeps non-zero minutes", () => {
    expect(formatLuckyTime("4:30 PM - 6:15 PM")).toBe("4:30–6:15 PM");
  });

  it("returns unknown formats untouched", () => {
    expect(formatLuckyTime("Dusk")).toBe("Dusk");
  });
});

describe("wrapText", () => {
  it("wraps greedily within the width", () => {
    expect(wrapText("aaa bbb ccc ddd", 70, charWidth)).toEqual(["aaa bbb", "ccc ddd"]);
  });

  it("never drops a word longer than the width", () => {
    expect(wrapText("supercalifragilistic ok", 50, charWidth)).toEqual(["supercalifragilistic", "ok"]);
  });

  it("truncates with an ellipsis past maxLines", () => {
    const lines = wrapText("one two three four five six seven", 90, charWidth, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("…")).toBe(true);
    lines.forEach((l) => expect(charWidth(l)).toBeLessThanOrEqual(90));
  });
});

describe("fitFontSize", () => {
  it("shrinks until the text fits", () => {
    expect(fitFontSize(500, 80, 40, (size) => size * 10)).toBe(50);
    expect(fitFontSize(5000, 80, 40, (size) => size * 10)).toBe(80);
    expect(fitFontSize(10, 80, 40, (size) => size * 10)).toBe(40);
  });
});

describe("buildCardData", () => {
  // Hexagram 46 升: wind below (yin, yang, yang), earth above.
  const stored: StoredReading = {
    id: "test",
    createdAt: new Date(2026, 8, 27, 9, 30).toISOString(),
    dateKey: "2026-09-27",
    lineValues: [8, 7, 9, 8, 8, 8],
  };
  const reading = hydrateReading(stored);
  const data = buildCardData(reading);

  it("maps the reading onto the card", () => {
    expect(data.hexagramNumber).toBe(46);
    expect(data.chinese).toBe("升");
    expect(data.english).toBe("Pushing Upward");
    expect(data.date).toBe("September 27");
    expect(data.quote).toBe("Momentum comes through consistent action rather than force.");
    expect(data.lines).toHaveLength(6);
    expect(data.lines[2]).toEqual({ yang: 1, changing: true });
    expect(data.score).toBe(reading.energy.score);
    expect(data.luckyColorHex).toBe(LUCKY_COLOR_HEX[reading.energy.luckyColor]);
    expect(data.luckyTime).not.toContain(":00");
  });

  it("builds the share text and file name", () => {
    expect(buildShareText({ ...data, label: "Momentum Day", score: 82 })).toBe(
      "Hexagram 46 · 升 Pushing Upward · Momentum Day 82/100 — fortune-toss.app",
    );
    expect(shareFileName(data, "2026-09-27")).toBe("fortune-toss-hexagram-46-2026-09-27.png");
  });

  it("has a swatch for every lucky color the engine can produce", () => {
    for (let n = 0; n < 200; n++) {
      const values = Array.from({ length: 6 }, (_, i) => ([6, 7, 8, 9] as const)[(n * 7 + i * 3) % 4]);
      const r = hydrateReading({ ...stored, lineValues: [...values], createdAt: new Date(2026, 0, 1 + n).toISOString() });
      expect(LUCKY_COLOR_HEX[r.energy.luckyColor]).toBeDefined();
    }
  });
});

describe("card variants", () => {
  it("offers light, ink and jade with a light default", () => {
    expect(CARD_VARIANTS.map((v) => v.id)).toEqual(["light", "ink", "jade"]);
    expect(getCardVariant("ink").id).toBe("ink");
    expect(getCardVariant("neon").id).toBe("light");
    expect(getCardVariant(undefined).id).toBe("light");
  });
});
