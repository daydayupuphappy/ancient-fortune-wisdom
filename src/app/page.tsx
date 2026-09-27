import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-20 text-center fade-up">
      <p className="eyebrow">Fortune Toss</p>
      <h1 className="display mt-6 text-5xl leading-[1.05] text-ink sm:text-6xl">
        What is today&apos;s energy trying to tell you?
      </h1>
      <p className="mt-5 max-w-md text-lg text-charcoal/80">A modern daily reflection inspired by the I Ching.</p>

      {/* Placeholder coins — replaced by the animated toss experience. */}
      <div className="my-14 flex items-center gap-6" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="zh flex h-20 w-20 items-center justify-center rounded-full border border-gold/70 bg-gradient-to-br from-gold-soft to-gold text-2xl text-ink/80 shadow-soft"
          >
            {i === 1 ? "福" : "易"}
          </span>
        ))}
      </div>

      <Link href="/reading" className="btn-primary">
        Toss my fortune
      </Link>
      <p className="mt-6 text-sm text-stone">Six tosses. One hexagram. A new perspective.</p>
    </section>
  );
}
