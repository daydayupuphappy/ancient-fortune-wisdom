export type CardVariantId = "light" | "ink" | "jade";

export interface CardPalette {
  bgTop: string;
  bgBottom: string;
  /** Primary type + hexagram lines. */
  ink: string;
  muted: string;
  accent: string;
  /** Soft glow near the top, as an "r, g, b" triplet. */
  glow: string;
  glowAlpha: number;
  /** Soft glow near the bottom, as an "r, g, b" triplet. */
  glowAlt: string;
  glowAltAlpha: number;
  frame: string;
  rule: string;
}

export interface CardVariant {
  id: CardVariantId;
  label: string;
  palette: CardPalette;
}

export const CARD_VARIANTS: readonly CardVariant[] = [
  {
    id: "light",
    label: "Light",
    palette: {
      bgTop: "#fffdf8",
      bgBottom: "#f3ecdd",
      ink: "#1c1a17",
      muted: "#8a837a",
      accent: "#b8913c",
      glow: "232, 216, 168",
      glowAlpha: 0.55,
      glowAlt: "207, 224, 214",
      glowAltAlpha: 0.55,
      frame: "rgba(201, 162, 74, 0.45)",
      rule: "rgba(28, 26, 23, 0.12)",
    },
  },
  {
    id: "ink",
    label: "Ink",
    palette: {
      bgTop: "#26231f",
      bgBottom: "#141210",
      ink: "#f7f3ea",
      muted: "#a59d90",
      accent: "#d8b565",
      glow: "201, 162, 74",
      glowAlpha: 0.22,
      glowAlt: "111, 154, 134",
      glowAltAlpha: 0.16,
      frame: "rgba(216, 181, 101, 0.4)",
      rule: "rgba(247, 243, 234, 0.14)",
    },
  },
  {
    id: "jade",
    label: "Jade",
    palette: {
      bgTop: "#eef4ef",
      bgBottom: "#c9ddd1",
      ink: "#1c2a24",
      muted: "#5d786b",
      accent: "#a7843a",
      glow: "255, 253, 248",
      glowAlpha: 0.7,
      glowAlt: "111, 154, 134",
      glowAltAlpha: 0.35,
      frame: "rgba(79, 127, 105, 0.45)",
      rule: "rgba(28, 42, 36, 0.14)",
    },
  },
];

export function getCardVariant(id: string | undefined): CardVariant {
  return CARD_VARIANTS.find((v) => v.id === id) ?? CARD_VARIANTS[0];
}
