import { describe, expect, it } from "vitest";
import { themeForDate } from "../../iching";
import { computeEnergyWindows } from "../windows";

describe("computeEnergyWindows", () => {
  it("produces repeatable, non-overlapping 2–4 day windows within each month", () => {
    for (let year = 2000; year <= 2100; year++) {
      for (let month = 1; month <= 12; month++) {
        const windows = computeEnergyWindows(year, month);
        const daysInMonth = new Date(year, month, 0).getDate();
        expect(windows).toEqual(computeEnergyWindows(year, month));
        expect(windows.length).toBeGreaterThanOrEqual(3);
        expect(windows.length).toBeLessThanOrEqual(5);
        windows.forEach((window, index) => {
          expect(window.startDay).toBeGreaterThanOrEqual(1);
          expect(window.endDay).toBeLessThanOrEqual(daysInMonth);
          expect(window.endDay - window.startDay + 1).toBeGreaterThanOrEqual(2);
          expect(window.endDay - window.startDay + 1).toBeLessThanOrEqual(4);
          expect(window.reflection).toMatch(/\?$/);
          if (index > 0) expect(window.startDay).toBeGreaterThan(windows[index - 1].endDay);
        });
      }
    }
  });

  it("keeps selected days thematically compatible with their window", () => {
    for (let month = 1; month <= 12; month++) {
      for (const window of computeEnergyWindows(2026, month)) {
        for (let day = window.startDay; day <= window.endDay; day++) {
          for (let otherDay = day + 1; otherDay <= window.endDay; otherDay++) {
            const theme = themeForDate(new Date(2026, month - 1, day));
            const other = themeForDate(new Date(2026, month - 1, otherDay));
            const active = ["Action", "High Energy"];
            const restful = ["Reflection", "Rest"];
            expect(active.includes(theme) && restful.includes(other) || restful.includes(theme) && active.includes(other)).toBe(false);
          }
        }
      }
    }
  });
});
