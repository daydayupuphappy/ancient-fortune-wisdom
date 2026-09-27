import type { TossLine } from "@/lib/iching";

interface Props {
  /** Bottom to top. Either full toss lines or plain 0/1 values. */
  lines: TossLine[] | number[];
  size?: "sm" | "md" | "lg";
  /** Number of lines to show (for line-by-line reveal animations). */
  revealed?: number;
  className?: string;
}

const HEIGHT = { sm: "h-1", md: "h-1.5", lg: "h-2.5" } as const;
const WIDTH = { sm: "w-16", md: "w-28", lg: "w-44" } as const;

/** Renders a hexagram top-to-bottom visually (top line first in DOM). */
export function HexagramLines({ lines, size = "md", revealed, className = "" }: Props) {
  const normalized = lines.map((l) =>
    typeof l === "number" ? { yang: l as 0 | 1, changing: false } : { yang: l.yang, changing: l.changing },
  );
  const shown = revealed ?? normalized.length;
  return (
    <div className={`flex flex-col-reverse items-center gap-2 ${className}`} aria-label="Hexagram">
      {normalized.map((l, i) => {
        const visible = i < shown;
        return (
          <div
            key={i}
            className={`relative flex ${WIDTH[size]} items-center justify-center transition-all duration-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {l.yang ? (
              <span className={`block w-full ${HEIGHT[size]} rounded-full bg-ink`} />
            ) : (
              <span className="flex w-full items-center justify-between gap-[18%]">
                <span className={`block w-full ${HEIGHT[size]} rounded-full bg-ink`} />
                <span className={`block w-full ${HEIGHT[size]} rounded-full bg-ink`} />
              </span>
            )}
            {l.changing && (
              <span className="absolute -right-5 text-xs text-gold" aria-label="changing line">
                {l.yang ? "○" : "×"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
