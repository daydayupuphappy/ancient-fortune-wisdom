import { TossExperience } from "@/components/toss/TossExperience";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-16 text-center fade-up sm:pt-20">
      <div className="flex items-center gap-3">
        <span
          className="zh flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-paper text-base text-ink/80 shadow-soft"
          aria-hidden
        >
          易
        </span>
        <p className="eyebrow">Fortune Toss</p>
      </div>
      <h1 className="display mt-8 text-5xl leading-[1.05] text-ink sm:text-6xl">
        What is today&apos;s energy trying to tell you?
      </h1>
      <p className="mt-5 max-w-md text-lg text-charcoal/80">A modern daily reflection inspired by the I Ching.</p>
      <TossExperience />
    </section>
  );
}
