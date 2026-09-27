import { NextResponse } from "next/server";
import { interpret, type OracleRequest } from "@/lib/ai/oracle";

const VALID = new Set([6, 7, 8, 9]);

function validate(body: unknown): OracleRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const lineValues = b.lineValues;
  if (!Array.isArray(lineValues) || lineValues.length !== 6 || !lineValues.every((v) => VALID.has(v as number))) {
    return null;
  }
  const date = typeof b.date === "string" && !Number.isNaN(Date.parse(b.date)) ? b.date : new Date().toISOString();
  const question = typeof b.question === "string" ? b.question.slice(0, 500) : undefined;
  const history = Array.isArray(b.history) ? b.history.filter((h): h is string => typeof h === "string").slice(0, 5) : undefined;
  return { lineValues: lineValues as OracleRequest["lineValues"], date, question, history };
}

/**
 * POST /api/interpret
 * Body: { lineValues: number[6], date?: string, question?: string, history?: string[] }
 * Returns: { text: string, source: "llm" | "fallback" }
 *
 * The hexagram is always derived server-side from lineValues; the LLM never picks one.
 */
export async function POST(request: Request) {
  const req = validate(await request.json().catch(() => null));
  if (!req) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const result = await interpret(req);
  return NextResponse.json(result);
}
