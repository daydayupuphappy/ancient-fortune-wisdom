import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { castFromValues } from "../iching";
import { newStoredReading } from "../reading";
import {
  getReading,
  getTodaysReading,
  loadReadings,
  loadStoredReadings,
  saveStoredReadings,
  upsertReading,
} from "../storage";

const KEY = "afw:readings:v1";

function makeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

const mk = (values: (6 | 7 | 8 | 9)[], iso: string, question?: string) =>
  newStoredReading(castFromValues(values), question, new Date(iso));

describe("storage", () => {
  let localStorage: ReturnType<typeof makeLocalStorage>;
  const dispatchEvent = vi.fn();

  beforeEach(() => {
    localStorage = makeLocalStorage();
    dispatchEvent.mockReset();
    vi.stubGlobal("window", { localStorage, dispatchEvent });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("loadStoredReadings", () => {
    it("returns an empty list when nothing is stored", () => {
      expect(loadStoredReadings()).toEqual([]);
    });

    it("returns an empty list when the stored JSON is corrupt", () => {
      localStorage.setItem(KEY, "{not json");
      expect(loadStoredReadings()).toEqual([]);
    });

    it("returns an empty list outside the browser", () => {
      vi.stubGlobal("window", undefined);
      expect(loadStoredReadings()).toEqual([]);
    });
  });

  describe("saveStoredReadings", () => {
    it("persists under the storage key and notifies listeners", () => {
      const r = mk([7, 7, 7, 7, 7, 7], "2026-09-27T10:00:00Z");
      saveStoredReadings([r]);
      expect(JSON.parse(localStorage.getItem(KEY) as string)).toEqual([r]);
      expect(dispatchEvent).toHaveBeenCalledTimes(1);
      expect((dispatchEvent.mock.calls[0][0] as Event).type).toBe("afw:readings-changed");
    });
  });

  describe("upsertReading", () => {
    it("appends a new reading and replaces an existing one by id", () => {
      const a = mk([7, 7, 7, 7, 7, 7], "2026-09-26T10:00:00Z");
      const b = mk([8, 8, 8, 8, 8, 8], "2026-09-27T10:00:00Z");
      upsertReading(a);
      upsertReading(b);
      expect(loadStoredReadings().map((r) => r.id)).toEqual([a.id, b.id]);

      upsertReading({ ...a, question: "Updated?" });
      const all = loadStoredReadings();
      expect(all).toHaveLength(2);
      expect(all[0]).toMatchObject({ id: a.id, question: "Updated?" });
    });
  });

  describe("loadReadings / getReading / getTodaysReading", () => {
    it("hydrates readings and sorts them newest first", () => {
      const older = mk([7, 7, 7, 7, 7, 7], "2026-09-25T10:00:00Z");
      const newer = mk([8, 8, 8, 8, 8, 8], "2026-09-27T10:00:00Z");
      saveStoredReadings([older, newer]);
      const readings = loadReadings();
      expect(readings.map((r) => r.id)).toEqual([newer.id, older.id]);
      expect(readings[0].cast.primary.number).toBe(2);
      expect(readings[0].energy.score).toBeGreaterThanOrEqual(0);
    });

    it("finds a reading by id and returns undefined for unknown ids", () => {
      const r = mk([9, 7, 7, 7, 7, 7], "2026-09-27T10:00:00Z");
      saveStoredReadings([r]);
      expect(getReading(r.id)?.cast.resulting?.number).toBe(44);
      expect(getReading("nope")).toBeUndefined();
    });

    it("returns the reading whose dateKey matches the given day", () => {
      const yesterday = mk([7, 7, 7, 7, 7, 7], "2026-09-26T12:00:00");
      const today = mk([8, 8, 8, 8, 8, 8], "2026-09-27T12:00:00");
      saveStoredReadings([yesterday, today]);
      expect(getTodaysReading(new Date("2026-09-27T20:00:00"))?.id).toBe(today.id);
      expect(getTodaysReading(new Date("2026-09-28T01:00:00"))).toBeUndefined();
    });
  });
});
