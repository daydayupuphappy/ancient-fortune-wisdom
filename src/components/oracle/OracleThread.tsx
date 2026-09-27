import { HexagramLines } from "@/components/HexagramLines";
import type { TossLine } from "@/lib/iching";
import type { OracleExchange } from "@/lib/oracle/history";

interface Props {
  exchanges: OracleExchange[];
  pendingQuestion?: string;
  error?: string;
  lines: TossLine[];
  onRetry?: () => void;
}

export function OracleThread({ exchanges, pendingQuestion, error, lines, onRetry }: Props) {
  if (exchanges.length === 0 && !pendingQuestion && !error) return null;

  return (
    <ol className="flex flex-col gap-8" aria-live="polite">
      {exchanges.map((ex, i) => (
        <li key={`${ex.askedAt}-${i}`} className="fade-up flex flex-col gap-3">
          <QuestionBubble question={ex.question} askedAt={ex.askedAt} />
          <AnswerBubble answer={ex.answer} />
        </li>
      ))}

      {pendingQuestion && (
        <li className="fade-up flex flex-col gap-3">
          <QuestionBubble question={pendingQuestion} />
          <div className="card flex items-center gap-5 px-6 py-6">
            <div className="oracle-breathe shrink-0">
              <HexagramLines lines={lines} size="sm" />
            </div>
            <div>
              <p className="eyebrow">The Oracle is reflecting</p>
              <p className="mt-1 text-sm text-stone">Reading the lines in light of your question…</p>
            </div>
          </div>
        </li>
      )}

      {error && (
        <li className="fade-up">
          <div className="card flex flex-col gap-3 border-vermilion/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-charcoal">{error}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn-secondary self-start px-4 py-2 text-xs">
                Try again
              </button>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}

function QuestionBubble({ question, askedAt }: { question: string; askedAt?: string }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <p className="max-w-[85%] rounded-3xl rounded-br-md bg-ink px-5 py-3 text-sm leading-relaxed text-cream sm:max-w-[70%]">
        {question}
      </p>
      {askedAt && (
        <time dateTime={askedAt} className="pr-2 text-[11px] tracking-wide text-stone">
          {new Date(askedAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </time>
      )}
    </div>
  );
}

function AnswerBubble({ answer }: { answer: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="zh mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/60 text-sm text-ink">
        易
      </span>
      <div className="card max-w-[92%] px-6 py-5 sm:max-w-[80%]">
        {answer.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-charcoal [&+&]:mt-3">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
