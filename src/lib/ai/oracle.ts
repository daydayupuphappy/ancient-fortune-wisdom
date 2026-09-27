import { castFromValues, deriveDailyEnergy, type LineValue } from "@/lib/iching";

export const ORACLE_SYSTEM_PROMPT = `You are a thoughtful modern interpreter of the I Ching.
Your role is to translate traditional symbolic ideas into clear, grounded reflections for modern life.
Do not claim certainty about future events.
Avoid statements such as:
'You will become rich.'
'You will meet your soulmate.'
'You will get the job.'
Instead say:
'This reading may suggest...'
'This can be a useful moment to consider...'
'The symbolism emphasizes...'
Treat the I Ching as a framework for reflection, perspective, and decision-making.
Never give medical, financial, or legal advice. This is an entertainment and self-reflection product.
Keep answers concise (120-220 words), warm, and free of jargon. Never invent a different hexagram than the one provided.`;

export interface OracleRequest {
  /** Six line values (6/7/8/9), bottom to top. The hexagram is derived from these. */
  lineValues: LineValue[];
  /** ISO date of the toss. */
  date: string;
  /** Optional user question. */
  question?: string;
  /** Brief summaries of recent readings, newest first. */
  history?: string[];
}

export function buildReadingContext(req: OracleRequest): string {
  const cast = castFromValues(req.lineValues);
  const energy = deriveDailyEnergy(cast, new Date(req.date));
  const { primary, resulting, changingLines } = cast;
  const parts = [
    `Date: ${req.date.slice(0, 10)}`,
    `Primary hexagram: ${primary.number} ${primary.chinese} (${primary.pinyin}) — ${primary.english}`,
    `Trigrams: ${primary.upper.english} over ${primary.lower.english}`,
    `Traditional theme: ${primary.theme}`,
    `Keywords: ${primary.keywords.join(", ")}`,
    `Changing lines: ${changingLines.length ? changingLines.join(", ") : "none"}`,
  ];
  if (resulting) {
    parts.push(
      `Resulting hexagram: ${resulting.number} ${resulting.chinese} (${resulting.pinyin}) — ${resulting.english}; theme ${resulting.theme}`,
    );
  }
  parts.push(`Daily theme (product mechanic): ${energy.theme}, energy score ${energy.score}/100`);
  if (req.history?.length) parts.push(`Recent readings: ${req.history.slice(0, 5).join(" | ")}`);
  if (req.question) parts.push(`User question: ${req.question}`);
  return parts.join("\n");
}

/** Local, deterministic fallback used when no LLM key is configured. */
export function fallbackInterpretation(req: OracleRequest): string {
  const cast = castFromValues(req.lineValues);
  const { primary, resulting, changingLines } = cast;
  const lines: string[] = [];
  lines.push(
    `${primary.english} (${primary.chinese}) places ${primary.upper.english.toLowerCase()} over ${primary.lower.english.toLowerCase()}. The symbolism emphasizes ${primary.keywords.slice(0, 3).join(", ")}.`,
  );
  lines.push(primary.interpretation);
  if (resulting) {
    lines.push(
      `With ${changingLines.length === 1 ? "one changing line" : `${changingLines.length} changing lines`}, the reading moves toward ${resulting.english} (${resulting.chinese}). This may suggest a shift from ${primary.theme.toLowerCase()} toward ${resulting.theme.toLowerCase()}.`,
    );
  }
  if (req.question) {
    lines.push(
      `In relation to your question — "${req.question}" — this can be a useful moment to consider how ${primary.keywords[0]} and ${primary.keywords[1]} apply to the situation, rather than looking for a fixed answer.`,
    );
  }
  return lines.join("\n\n");
}

/**
 * Calls an OpenAI-compatible chat completions endpoint if OPENAI_API_KEY is set,
 * otherwise returns the deterministic fallback. Server-only.
 */
export async function interpret(req: OracleRequest): Promise<{ text: string; source: "llm" | "fallback" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { text: fallbackInterpretation(req), source: "fallback" };

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const user = req.question
    ? `Here is the existing reading. Interpret it in relation to the user's question. Do not create a new reading.\n\n${buildReadingContext(req)}`
    : `Here is today's reading. Write a modern reflection with a short "Today's message" paragraph and one reflection question.\n\n${buildReadingContext(req)}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          { role: "system", content: ORACLE_SYSTEM_PROMPT },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`LLM error ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty LLM response");
    return { text, source: "llm" };
  } catch {
    return { text: fallbackInterpretation(req), source: "fallback" };
  }
}
