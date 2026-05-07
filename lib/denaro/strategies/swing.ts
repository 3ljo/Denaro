import type { StrategyDefinition } from './types'

export const SWING: StrategyDefinition = {
  id: 'swing',
  tier: 'pro',
  chatLens: `Operator's lens: Swing Trading. Anchor on D1/H4 only — patient entries, wide stops (1.5–3 ATR), 1:3+ RR, multi-day to multi-week holds. Wait for HTF confluence: weekly level reaction, daily structural break, H4 confirmation. Vocabulary: weekly level, daily structural break, weekly bias, multi-day continuation, swing high/low, weekly close. Ignore intraday noise unless it's a textbook H4 entry on top of a D1 bias.`,
  cardLens: `Frame for swing trading: D1/H4 bias only, weekly + daily levels, multi-day horizon. Levels should reflect HTF zones (weekly close, daily swings), not M15 chop. RR target should be 1:3+.`,
  visionLens: `Operator picked Swing Trading. Read every section through that lens — D1/H4 anchors only. Treat the M15 chart as noise unless it confirms an H4 entry. No intraday-scalping commentary.`,
  visionSections: [
    {
      heading: 'D1 Bias',
      instruction: '1-2 sentences — daily swing structure and multi-week trend context. Reference recent weekly closes and daily swing points.',
    },
    {
      heading: 'Key Levels',
      instruction: '- Bullet each HTF level (price + 2-4 word context, e.g. "4612 — weekly close" or "4640 — daily swing high"). Weekly highs/lows, daily structural levels, multi-month swing points.',
    },
    {
      heading: 'Entry Window',
      instruction: '1-2 sentences — patient entry zone. Wait for daily reaction confirmation, weekly level reaction, or H4 confluence with D1 bias. No M15 entries.',
    },
    {
      heading: 'Bias',
      instruction: 'ONE word: BULLISH, BEARISH, or NEUTRAL. Then one sentence justification anchored on D1/H4.',
    },
    {
      heading: 'Invalidation',
      instruction: 'One sentence — daily close beyond a structural level invalidates the swing thesis. Multi-day timeframe — no tight intraday stops.',
    },
  ],
  newsLens: `Frame each scenario as a multi-day bias adjustment. Hot may shift the weekly bias; describe the level + horizon, not the next-hour reaction.`,
  newsHorizon: 'days',
  visionStack: ['1wk', '1d', '4h'],
  cardFields: [
    {
      id: 'weekly_resistances',
      label: 'Weekly Resistance',
      kind: 'level-list',
      tone: 'rose',
      count: 3,
    },
    {
      id: 'weekly_supports',
      label: 'Weekly Support',
      kind: 'level-list',
      tone: 'emerald',
      count: 3,
    },
    { id: 'entry_window', label: 'Entry Window (D1 / H4)', kind: 'text-line' },
    { id: 'invalidation', label: 'Daily Close Invalidation', kind: 'text-line' },
  ],
  quickPrompts: [
    {
      label: 'Weekly bias',
      prompt: 'Read [pair] from the weekly chart. Bias for the next 1-2 weeks, key weekly levels, invalidation.',
    },
    {
      label: 'Entry window',
      prompt: 'On [pair], where is the next D1/H4 entry window? What confluence to wait for?',
    },
    {
      label: 'Multi-day target',
      prompt: 'Map the next multi-day target on [pair]. Weekly level, prior swing high/low, structural target.',
    },
    {
      label: 'Patient or live',
      prompt: 'Is [pair] a patient setup or live now? D1/H4 confluence check.',
    },
  ],
}
