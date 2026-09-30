import { describe, expect, it } from "vitest";
import { getHexagram, hexagramFromLines } from "../hexagrams";
import { castFromValues } from "../toss";
import { trigramFromLines, type LinePattern } from "../trigrams";

describe("getHexagram", () => {
  it("rejects numbers outside 1..64", () => {
    expect(() => getHexagram(0)).toThrow("Invalid hexagram number 0");
    expect(() => getHexagram(65)).toThrow("Invalid hexagram number 65");
  });
});

describe("hexagramFromLines", () => {
  it("rejects patterns that are not six binary lines", () => {
    expect(() => hexagramFromLines([1, 1, 1])).toThrow("No hexagram for lines 111");
    expect(() => hexagramFromLines([1, 1, 1, 1, 1, 2])).toThrow("No hexagram for lines 111112");
  });
});

describe("trigramFromLines", () => {
  it("maps a bottom-to-top line pattern to its trigram", () => {
    expect(trigramFromLines([1, 1, 1]).pinyin).toBe("Qián");
    expect(trigramFromLines([0, 0, 0]).pinyin).toBe("Kūn");
    expect(trigramFromLines([1, 0, 0]).english).toBe("Thunder");
    expect(trigramFromLines([0, 1, 0]).english).toBe("Water");
  });

  it("rejects patterns that match no trigram", () => {
    expect(() => trigramFromLines([2, 0, 0] as unknown as LinePattern)).toThrow("No trigram for lines 200");
  });
});

describe("castFromValues", () => {
  it("requires exactly six line values", () => {
    expect(() => castFromValues([7, 7, 7])).toThrow("A cast needs exactly six line values");
    expect(() => castFromValues([7, 7, 7, 7, 7, 7, 7])).toThrow("A cast needs exactly six line values");
  });
});
