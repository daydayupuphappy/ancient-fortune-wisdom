# Ancient Fortune Wisdom

**Toss the coins. Read the moment.**
A daily reflection inspired by the I Ching (易经).

Core loop: **Toss → Hexagram → AI interpretation → Lucky timing → Calendar → Share**

> Entertainment and self-reflection only. Never present readings as predictions or as medical, financial, or legal advice. Use "may suggest", "can be a useful moment to consider", "the symbolism emphasizes".

Full product spec: [`docs/SPEC.md`](docs/SPEC.md).

## Stack

- Next.js 16 (App Router, `src/` dir, Turbopack), React 19, TypeScript
- Tailwind CSS v4 (tokens in `src/app/globals.css`)
- Vitest for unit tests
- Persistence (MVP): `localStorage` via `src/lib/storage.ts`
- AI: OpenAI-compatible chat completions via `POST /api/interpret` (falls back to a deterministic local interpretation when `OPENAI_API_KEY` is unset)

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build
```

Env (optional): `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` (default `gpt-4o-mini`).

## Architecture

```
src/
  lib/iching/
    trigrams.ts   # 八卦 — 8 trigrams (chinese, pinyin, element, direction, family, lines)
    hexagrams.ts  # all 64 hexagrams (King Wen order), HEXAGRAMS, getHexagram, hexagramFromLines
    toss.ts       # three-coin method: castHexagram, castFromValues, resolveCast, seededRng
    energy.ts     # deterministic daily score/label/theme/attributes, themeForDate (calendar)
  lib/reading.ts  # StoredReading (persisted) + Reading (hydrated), hydrateReading, newStoredReading
  lib/storage.ts  # localStorage CRUD, getTodaysReading, computeStreak
  lib/ai/oracle.ts# system prompt, buildReadingContext, interpret() (LLM or fallback)
  app/api/interpret/route.ts  # POST { lineValues, date?, question?, history? } -> { text, source }
  components/
    SiteNav.tsx, HexagramLines.tsx
  app/  (/, /reading, /oracle, /calendar, /history, /explore, /share)
```

### Invariants

- The hexagram is **always** derived from six coin tosses (`lineValues` 6/7/8/9, bottom → top). The LLM never picks a hexagram.
- Only `lineValues` + timestamps are persisted; everything else is re-derived via `hydrateReading` so the data model stays tiny and stable.
- Line 1 = bottom. `HexagramLines` renders bottom-to-top visually via `flex-col-reverse`.
- Daily energy/attributes come from `deriveDailyEnergy(cast, date)` and are deterministic. Present them as playful symbolic prompts.
- Chinese characters use the `.zh` class (Noto Serif SC); headlines use `.display` (Cormorant Garamond); UI text is Inter.

### Design tokens

Cream background, ink/charcoal type, gold + jade accents, generous whitespace, subtle motion. Utility classes: `.card`, `.btn-primary`, `.btn-secondary`, `.eyebrow`, `.fade-up`. No casino/neon/crystal-ball imagery.

## Contributing (parallel work)

Each feature lives in its own route folder + components, so features can be developed in parallel with minimal conflicts. Shared modules under `src/lib` are the contract; extend them additively (new exports) rather than changing existing signatures. Add tests next to the code in `__tests__/`.
