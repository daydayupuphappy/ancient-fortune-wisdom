# Product Spec — Ancient Fortune Wisdom ("Fortune Toss")

Working name: **Ancient Fortune Wisdom**. Tagline: **Toss the coins. Read the moment.** Secondary: *A daily reflection inspired by the I Ching.*

A polished, gamified full-stack web app inspired by the 易经 / I Ching — a modern spiritual-reflection companion: beautiful, playful, calming, slightly magical. Present traditional concepts respectfully but simply, for users with no prior knowledge.

**Product principle:** entertainment and self-reflection. Never present readings as guaranteed predictions or as medical, financial, legal advice, or deterministic statements about the future.

## 1. Main user journey

Homepage: "How is today's energy unfolding?" / "What is today's energy trying to tell you?" with three beautiful animated coins. CTA **Toss My Fortune**. Pressing it animates three coins tossed, repeated six times; each toss creates one hexagram line, built bottom → top, lines animating onto the screen one by one. Then reveal:

- Primary hexagram (Chinese name, English name, number, trigram structure)
- Changing lines (if any) and resulting hexagram (if applicable)
- Modern AI interpretation
- Today's practical reflection

Example:

> **Hexagram 46 — 升 / Pushing Upward** · Theme: Gradual Progress
> Today's message: "Momentum comes through consistent action rather than force. A small step taken with intention may matter more than a dramatic move."
> Today may favor: Important conversations · Learning · Reconnecting with someone · Making progress on a long-term project
> Consider avoiding: Rushing decisions · Trying to control outcomes · Taking on too many commitments
> Lucky energy window: 4:00 PM – 6:00 PM · Lucky direction: East · Lucky element: Wood
> Reflection question: "What small action today would move something important forward?"
> CTA: **Ask the Oracle**

## 2. Coin-toss logic (implemented in `src/lib/iching/toss.ts`)

Heads = 3, Tails = 2, three coins → totals 6 (Old Yin), 7 (Young Yang), 8 (Young Yin), 9 (Old Yang). Six tosses; first = bottom line, sixth = top. Glyphs:

```
Young Yang  ────────────
Young Yin   ───── ─────
Old Yang    ──────────── ○
Old Yin     ───── ───── ×
```

Old Yin → Yang, Old Yang → Yin. If changing lines exist, compute the resulting hexagram. Store both.

## 3. Data (implemented in `src/lib/iching/hexagrams.ts`, `trigrams.ts`)

All 64 hexagrams: number, Chinese, pinyin, English, upper/lower trigram, line pattern, theme, modern interpretation, keywords. Eight trigrams 乾坤震巽坎离艮兑 with element, direction, family, qualities. Don't overwhelm the main screen with theory — advanced details go under **Explore this Hexagram**.

## 4. AI interpretation (`src/lib/ai/oracle.ts`, `POST /api/interpret`)

LLM receives primary hexagram, changing lines, resulting hexagram, optional question, date, recent history. The LLM never invents a hexagram — the cast is deterministic; AI only interprets. System prompt (in code) forbids certainty ("You will get the job") and prefers "This reading may suggest…".

## 5. Ask the Oracle (`/oracle`)

After a reading, users ask a question (e.g. "How should I approach an important conversation?"). AI interprets the **existing** hexagram in relation to the question. No new toss unless the user explicitly clicks **Toss Again**.

## 6. Daily Energy Score

"Today's Energy 82 / 100 — ✨ Momentum Day". Labels: Exceptional Day, Momentum Day, Connection Day, Creative Day, Growth Day, Reflection Day, Rest Day. Clearly a playful mechanic derived from the reading (`deriveDailyEnergy`).

## 7. Daily attributes

Lucky color, lucky number, lucky direction, best time window, today's element, today's focus, avoid, reflection question. Symbolic prompts.

## 8. Lucky calendar (`/calendar`)

Monthly view; each day shows a small energy indicator (✨ Connection, 🔥 Action, 🌿 Growth, 🌙 Reflection, ⚡ High Energy…). Click a day → its symbolic theme. Also identify several broader monthly **Energy Windows** (e.g. "October 3–6 · Connection · Good for: networking, conversations, reconnecting"). Never imply guaranteed outcomes.

## 9. Calendar integration

Buttons **Add to Calendar** and **Add All <Month> Energy Windows**. MVP: downloadable `.ics` (Google/Apple/Outlook). Also direct Google Calendar links if easy. Example event title: "✨ Fortune Toss — Momentum Window"; description includes theme + reflection question.

## 10. Fortune history (`/history`)

List past readings (date, hexagram number + Chinese, theme, score). Open any past reading.

## 11. Gamification

Daily streak ("🔥 12-Day Streak — You've reflected for 12 days."), weekly energy summary ("Your Week: 3 Growth Days, 2 Connection Days…"), optional badges: First Toss, 7-Day Streak, 30-Day Journey, Explored 10 Hexagrams, Explored All Eight Trigrams. Don't overbuild.

## 12. Shareable fortune cards (`/share`)

Portrait-format card: FORTUNE TOSS · date · ✨ 82 · MOMENTUM DAY · Hexagram 46 · 升 · Pushing Upward · quote · Lucky Color · Lucky Time · `fortune-toss.app`. Good for Instagram Stories, WhatsApp, X, LinkedIn, WeChat. Export as PNG download + Web Share API.

## 13. Homepage & visual design

Small logo · FORTUNE TOSS · headline "What is today's energy trying to tell you?" · subtitle · three animated coins · CTA **TOSS MY FORTUNE** · "Six tosses. One hexagram. A new perspective."

Modern East Asian minimalism: Apple × Headspace × modern Chinese editorial. Cream backgrounds, charcoal type, subtle gold, muted jade, generous whitespace, serif for Chinese characters, clean sans for UI. Subtle motion; metallic physical coins; lines animate one by one. Avoid casino/gambling visuals, crystal balls, neon, stereotypical Chinese graphics, clutter.

## 14. Screens

Home (daily toss) · Reading (hexagram + interpretation) · Ask the Oracle · Calendar · History · Explore (hexagrams & trigrams) · Share card.
