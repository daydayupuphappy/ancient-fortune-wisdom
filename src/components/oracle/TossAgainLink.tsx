import Link from "next/link";

export function TossAgainLink() {
  return (
    <div className="group relative flex flex-col items-center gap-2">
      <Link href="/" className="btn-secondary" aria-describedby="toss-again-note">
        <span aria-hidden className="text-gold">
          ◎
        </span>
        Toss Again
      </Link>
      <p
        id="toss-again-note"
        role="tooltip"
        className="text-xs text-stone transition-colors group-hover:text-charcoal group-focus-within:text-charcoal"
      >
        Starts a new reading — this thread stays saved in your history.
      </p>
    </div>
  );
}
