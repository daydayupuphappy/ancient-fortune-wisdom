import { describe, expect, it } from "vitest";
import { HEXAGRAMS, getHexagram } from "../../iching";
import {
  filterHexagrams,
  hexagramFor,
  isTrigramKey,
  matchesQuery,
  nextHexagramNumber,
  normalize,
  oppositeHexagram,
  prevHexagramNumber,
  swappedHexagram,
} from "..";

describe("normalize", () => {
  it("strips diacritics and case", () => {
    expect(normalize("Qián")).toBe("qian");
    expect(normalize("  Dà Zhuàng ")).toBe("da zhuang");
  });
});

describe("matchesQuery", () => {
  const h1 = getHexagram(1);
  it("matches by number exactly", () => {
    expect(matchesQuery(h1, "1")).toBe(true);
    expect(matchesQuery(h1, "11")).toBe(false);
  });
  it("matches Chinese, pinyin (with or without tones), English, theme, keywords", () => {
    expect(matchesQuery(h1, "乾")).toBe(true);
    expect(matchesQuery(h1, "qian")).toBe(true);
    expect(matchesQuery(h1, "Qián")).toBe(true);
    expect(matchesQuery(h1, "creative")).toBe(true);
    expect(matchesQuery(h1, "Creative Power")).toBe(true);
    expect(matchesQuery(h1, "leadership")).toBe(true);
    expect(matchesQuery(h1, "receptive")).toBe(false);
  });
  it("empty query matches everything", () => {
    expect(filterHexagrams({ query: "   " })).toHaveLength(64);
  });
});

describe("filterHexagrams", () => {
  it("filters by upper and lower trigram", () => {
    expect(filterHexagrams({ upper: "heaven" })).toHaveLength(8);
    expect(filterHexagrams({ lower: "earth" })).toHaveLength(8);
    const both = filterHexagrams({ upper: "earth", lower: "heaven" });
    expect(both).toHaveLength(1);
    expect(both[0].number).toBe(11);
  });
  it("combines query with trigram filter", () => {
    const r = filterHexagrams({ upper: "heaven", query: "conflict" });
    expect(r.map((h) => h.number)).toEqual([6]);
  });
});

describe("related hexagrams", () => {
  it("opposite flips every line", () => {
    expect(oppositeHexagram(getHexagram(1)).number).toBe(2);
    expect(oppositeHexagram(getHexagram(11)).number).toBe(12);
    for (const h of HEXAGRAMS) expect(oppositeHexagram(oppositeHexagram(h)).number).toBe(h.number);
  });
  it("swapped exchanges trigrams, null for doubled trigrams", () => {
    expect(swappedHexagram(getHexagram(1))).toBeNull();
    expect(swappedHexagram(getHexagram(29))).toBeNull();
    expect(swappedHexagram(getHexagram(11))?.number).toBe(12);
    expect(swappedHexagram(getHexagram(3))?.number).toBe(40);
  });
  it("hexagramFor covers the full 8x8 matrix", () => {
    const seen = new Set<number>();
    for (const h of HEXAGRAMS) seen.add(hexagramFor(h.upper.key, h.lower.key).number);
    expect(seen.size).toBe(64);
    expect(hexagramFor("heaven", "heaven").number).toBe(1);
    expect(hexagramFor("earth", "heaven").number).toBe(11);
  });
});

describe("navigation & params", () => {
  it("wraps prev/next", () => {
    expect(prevHexagramNumber(1)).toBe(64);
    expect(nextHexagramNumber(64)).toBe(1);
    expect(nextHexagramNumber(5)).toBe(6);
  });
  it("validates trigram keys", () => {
    expect(isTrigramKey("heaven")).toBe(true);
    expect(isTrigramKey("sky")).toBe(false);
    expect(isTrigramKey(null)).toBe(false);
  });
});
