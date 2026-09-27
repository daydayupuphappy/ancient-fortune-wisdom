"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Toss" },
  { href: "/reading", label: "Reading" },
  { href: "/oracle", label: "Oracle" },
  { href: "/calendar", label: "Calendar" },
  { href: "/history", label: "History" },
  { href: "/explore", label: "Explore" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-mist/60 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="zh flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 text-lg text-ink">
            易
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink">Fortune Toss</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  active ? "bg-ink text-cream" : "text-charcoal hover:bg-cream-deep"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
