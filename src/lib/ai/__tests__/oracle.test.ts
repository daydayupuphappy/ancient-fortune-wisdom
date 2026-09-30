import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// oracle.ts imports via the `@/` tsconfig alias, which Vitest does not resolve
// without a config file; point it at the real module.
vi.mock("@/lib/iching", () => import("../../iching"));

import { buildReadingContext, fallbackInterpretation, interpret, ORACLE_SYSTEM_PROMPT } from "../oracle";

const CREATIVE = [7, 7, 7, 7, 7, 7] as const; // Hexagram 1, no changing lines
const ONE_CHANGE = [9, 7, 7, 7, 7, 7] as const; // 1 → 44 (bottom line changes)
const TWO_CHANGES = [9, 9, 7, 7, 7, 7] as const; // 1 → 33
const DATE = "2026-09-27T10:00:00.000Z";

describe("buildReadingContext", () => {
  it("describes the primary hexagram derived from the line values", () => {
    const ctx = buildReadingContext({ lineValues: [...CREATIVE], date: DATE });
    expect(ctx).toContain("Date: 2026-09-27");
    expect(ctx).toContain("Primary hexagram: 1 乾 (Qián) — The Creative");
    expect(ctx).toContain("Trigrams: Heaven over Heaven");
    expect(ctx).toContain("Changing lines: none");
    expect(ctx).not.toContain("Resulting hexagram");
    expect(ctx).not.toContain("User question");
    expect(ctx).not.toContain("Recent readings");
  });

  it("adds the resulting hexagram when lines change", () => {
    const ctx = buildReadingContext({ lineValues: [...ONE_CHANGE], date: DATE });
    expect(ctx).toContain("Changing lines: 1");
    expect(ctx).toContain("Resulting hexagram: 44");
  });

  it("appends the question and at most five history entries", () => {
    const history = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const ctx = buildReadingContext({ lineValues: [...CREATIVE], date: DATE, question: "What now?", history });
    expect(ctx).toContain("User question: What now?");
    expect(ctx).toContain("Recent readings: h1 | h2 | h3 | h4 | h5");
    expect(ctx).not.toContain("h6");
  });

  it("omits the history section when it is empty", () => {
    const ctx = buildReadingContext({ lineValues: [...CREATIVE], date: DATE, history: [] });
    expect(ctx).not.toContain("Recent readings");
  });
});

describe("fallbackInterpretation", () => {
  it("is derived from the cast and uses reflective language", () => {
    const text = fallbackInterpretation({ lineValues: [...CREATIVE], date: DATE });
    expect(text).toContain("The Creative (乾) places heaven over heaven");
    expect(text).toContain("The symbolism emphasizes");
    expect(text).not.toMatch(/you will/i);
    expect(text).not.toContain("changing line");
    expect(text).not.toContain("In relation to your question");
  });

  it("uses singular wording for one changing line", () => {
    const text = fallbackInterpretation({ lineValues: [...ONE_CHANGE], date: DATE });
    expect(text).toContain("With one changing line, the reading moves toward Coming to Meet (姤)");
  });

  it("uses plural wording for several changing lines", () => {
    const text = fallbackInterpretation({ lineValues: [...TWO_CHANGES], date: DATE });
    expect(text).toContain("With 2 changing lines, the reading moves toward Retreat (遁)");
  });

  it("relates the reading to the question without giving a fixed answer", () => {
    const text = fallbackInterpretation({ lineValues: [...CREATIVE], date: DATE, question: "Should I switch jobs?" });
    expect(text).toContain('In relation to your question — "Should I switch jobs?"');
    expect(text).toContain("rather than looking for a fixed answer");
  });
});

describe("interpret", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const ok = (content: string | undefined) =>
    ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }) as Response;

  it("returns the deterministic fallback without calling the network when no key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", undefined);
    const result = await interpret({ lineValues: [...CREATIVE], date: DATE });
    expect(result.source).toBe("fallback");
    expect(result.text).toBe(fallbackInterpretation({ lineValues: [...CREATIVE], date: DATE }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls the chat completions endpoint with the system prompt and returns the LLM text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_BASE_URL", "https://llm.example/v1");
    vi.stubEnv("OPENAI_MODEL", "test-model");
    fetchMock.mockResolvedValue(ok("  A grounded reflection.  "));

    const result = await interpret({ lineValues: [...CREATIVE], date: DATE, question: "Focus?" });

    expect(result).toEqual({ text: "A grounded reflection.", source: "llm" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://llm.example/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body as string) as { model: string; messages: { role: string; content: string }[] };
    expect(body.model).toBe("test-model");
    expect(body.messages[0]).toEqual({ role: "system", content: ORACLE_SYSTEM_PROMPT });
    expect(body.messages[1].content).toContain("Do not create a new reading");
    expect(body.messages[1].content).toContain("User question: Focus?");
  });

  it("uses the daily-reflection prompt and default endpoint when there is no question", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_BASE_URL", undefined);
    vi.stubEnv("OPENAI_MODEL", undefined);
    fetchMock.mockResolvedValue(ok("Reflection"));

    await interpret({ lineValues: [...CREATIVE], date: DATE });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    const body = JSON.parse(init.body as string) as { model: string; messages: { content: string }[] };
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.messages[1].content).toContain("Write a modern reflection");
  });

  it.each([
    ["non-OK response", () => ({ ok: false, status: 500, json: async () => ({}) }) as Response],
    ["empty content", () => ok("")],
    ["missing choices", () => ({ ok: true, status: 200, json: async () => ({}) }) as Response],
  ])("falls back on %s", async (_label, response) => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    fetchMock.mockResolvedValue(response());
    const result = await interpret({ lineValues: [...ONE_CHANGE], date: DATE });
    expect(result.source).toBe("fallback");
    expect(result.text).toBe(fallbackInterpretation({ lineValues: [...ONE_CHANGE], date: DATE }));
  });

  it("falls back when fetch throws", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    fetchMock.mockRejectedValue(new Error("network down"));
    const result = await interpret({ lineValues: [...CREATIVE], date: DATE });
    expect(result.source).toBe("fallback");
  });
});
