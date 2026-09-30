import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OracleRequest } from "@/lib/ai/oracle";

// route.ts imports `@/lib/ai/oracle`, which Vitest cannot resolve without a
// config file, so the oracle module is mocked here (and it isolates the route
// from LLM/env concerns anyway).
const { interpret } = vi.hoisted(() => ({ interpret: vi.fn() }));
vi.mock("@/lib/ai/oracle", () => ({ interpret }));

import { POST } from "../route";

const VALID_LINES = [7, 8, 9, 6, 7, 8];

function post(body: unknown, raw = false) {
  return POST(
    new Request("http://localhost/api/interpret", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );
}

describe("POST /api/interpret", () => {
  beforeEach(() => {
    interpret.mockReset();
    interpret.mockResolvedValue({ text: "Reflection", source: "fallback" });
  });

  it.each([
    ["non-JSON body", "not json", true],
    ["non-object body", 42, false],
    ["missing lineValues", { date: "2026-09-27" }, false],
    ["wrong number of lines", { lineValues: [7, 7, 7] }, false],
    ["invalid line value", { lineValues: [7, 7, 7, 7, 7, 5] }, false],
    ["non-numeric line value", { lineValues: [7, 7, 7, 7, 7, "9"] }, false],
  ])("returns 400 for %s", async (_label, body, raw) => {
    const res = await post(body, raw as boolean);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid request" });
    expect(interpret).not.toHaveBeenCalled();
  });

  it("interprets a valid request and returns the oracle result", async () => {
    const res = await post({ lineValues: VALID_LINES, date: "2026-09-27T10:00:00.000Z", question: "Focus?" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ text: "Reflection", source: "fallback" });
    expect(interpret).toHaveBeenCalledWith({
      lineValues: VALID_LINES,
      date: "2026-09-27T10:00:00.000Z",
      question: "Focus?",
      history: undefined,
    });
  });

  it("falls back to the current date when the date is missing or unparseable", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:34:56.000Z"));
    try {
      await post({ lineValues: VALID_LINES, date: "not-a-date" });
      await post({ lineValues: VALID_LINES });
    } finally {
      vi.useRealTimers();
    }
    const dates = interpret.mock.calls.map(([req]) => (req as OracleRequest).date);
    expect(dates).toEqual(["2026-09-27T12:34:56.000Z", "2026-09-27T12:34:56.000Z"]);
  });

  it("truncates the question to 500 characters and ignores non-string questions", async () => {
    await post({ lineValues: VALID_LINES, question: "q".repeat(600) });
    await post({ lineValues: VALID_LINES, question: 123 });
    const questions = interpret.mock.calls.map(([req]) => (req as OracleRequest).question);
    expect(questions[0]).toHaveLength(500);
    expect(questions[1]).toBeUndefined();
  });

  it("keeps only the first five string history entries", async () => {
    await post({ lineValues: VALID_LINES, history: ["a", 1, "b", null, "c", "d", "e", "f"] });
    await post({ lineValues: VALID_LINES, history: "not-an-array" });
    const histories = interpret.mock.calls.map(([req]) => (req as OracleRequest).history);
    expect(histories[0]).toEqual(["a", "b", "c", "d", "e"]);
    expect(histories[1]).toBeUndefined();
  });
});
