"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { MAX_QUESTION_LENGTH, normalizeQuestion, SUGGESTED_QUESTIONS } from "@/lib/oracle/history";

interface Props {
  disabled?: boolean;
  onAsk: (question: string) => void;
}

export function OracleComposer({ disabled, onAsk }: Props) {
  const [draft, setDraft] = useState("");
  const question = normalizeQuestion(draft);
  const canSend = !disabled && question.length > 0;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onAsk(question);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(q)}
            className="rounded-full border border-mist bg-paper px-4 py-2 text-left text-[13px] text-charcoal transition hover:border-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="card flex flex-col gap-3 p-3 focus-within:border-gold/70 sm:flex-row sm:items-end">
        <label className="sr-only" htmlFor="oracle-question">
          Your question
        </label>
        <textarea
          id="oracle-question"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          rows={2}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder="Ask about a decision, a relationship, a season of your life…"
          className="min-h-[3.5rem] w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed text-ink placeholder:text-stone/70 focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1 sm:flex-col sm:items-end sm:pb-0">
          <span className="text-[11px] tabular-nums text-stone">
            {question.length}/{MAX_QUESTION_LENGTH}
          </span>
          <button type="submit" disabled={!canSend} className="btn-primary px-6 py-2.5 disabled:opacity-40">
            Ask
          </button>
        </div>
      </div>
    </form>
  );
}
