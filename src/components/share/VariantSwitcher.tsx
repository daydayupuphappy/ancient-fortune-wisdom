"use client";

import { CARD_VARIANTS, type CardVariantId } from "@/lib/share/variants";

interface Props {
  value: CardVariantId;
  onChange: (id: CardVariantId) => void;
}

export function VariantSwitcher({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Card style" className="inline-flex rounded-full border border-mist bg-paper p-1">
      {CARD_VARIANTS.map((v) => {
        const active = v.id === value;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              active ? "bg-ink text-cream" : "text-charcoal hover:bg-cream-deep"
            }`}
          >
            <span
              aria-hidden
              className={`h-3 w-3 rounded-full border ${active ? "border-cream/60" : "border-ink/15"}`}
              style={{ background: `linear-gradient(135deg, ${v.palette.bgTop}, ${v.palette.bgBottom})` }}
            />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
