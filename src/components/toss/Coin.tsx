import type { CoinFace } from "@/lib/iching";

interface Props {
  /** Face showing once settled. `undefined` while idle (shows heads). */
  face?: CoinFace;
  flipping?: boolean;
  idle?: boolean;
  /** Stagger the flip a little per coin for a physical feel. */
  delayMs?: number;
  className?: string;
}

/** A metallic coin. Heads (3) shows 福, tails (2) shows 易. */
export function Coin({ face, flipping = false, idle = false, delayMs = 0, className = "" }: Props) {
  const tails = face === 2 && !flipping;
  return (
    <div className={`coin-scene ${idle ? "coin-idle" : ""} ${className}`} aria-hidden>
      <div
        className={`coin ${flipping ? "coin--flipping" : ""} ${tails ? "coin--tails" : ""}`}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <span className="coin-rim" />
        <span className="coin-face">
          <span className="zh text-3xl font-semibold text-ink/75">福</span>
        </span>
        <span className="coin-face coin-face--back">
          <span className="zh text-3xl font-semibold text-ink/75">易</span>
        </span>
      </div>
    </div>
  );
}
