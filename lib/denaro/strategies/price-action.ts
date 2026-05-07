import type { StrategyDefinition } from './types'

export const PRICE_ACTION: StrategyDefinition = {
  id: 'price-action',
  tier: 'free',
  chatLens: `Operator's lens: Pure Price Action. Anchor reads in raw structure — supply/demand zones, swing points, candlestick patterns, market profile. No SMC jargon (avoid OB / FVG / liquidity sweep) unless the operator uses it first. No indicators. Vocabulary: HH/HL, LH/LL, supply zone, demand zone, rejection wick, engulfing, inside bar, breakout, retest. Invalidation = clean break of the swing structure that defines the bias.`,
  cardLens: `Frame the read in pure price action: supply/demand zones, swing structure (HH/HL or LH/LL), candlestick reads. No SMC jargon (no OB/FVG/sweep). No indicators.`,
  visionLens: `Operator picked Pure Price Action. Read every section through that lens — swing points, supply/demand zones, candlestick patterns. Avoid SMC jargon and indicators.`,
  visionSections: [
    {
      heading: 'HTF Structure',
      instruction: '1-2 sentences from the highest TF — swing structure (HH/HL or LH/LL), market phase (impulse/correction/range).',
    },
    {
      heading: 'Key Levels',
      instruction: '- Bullet each level visible (price + 2-4 word context, e.g. "4612 — H4 supply zone" or "4595 — daily swing low"). Use supply/demand zone language.',
    },
    {
      heading: 'Entry Setup',
      instruction: '1-2 sentences — candlestick read at the LTF: engulfing, rejection wick, inside bar break, breaker pattern, pin bar.',
    },
    {
      heading: 'Bias',
      instruction: 'ONE word: BULLISH, BEARISH, or NEUTRAL. Then one sentence justification anchored in swing structure.',
    },
    {
      heading: 'Invalidation',
      instruction: 'One sentence — clean break of the swing low/high that defines the bias.',
    },
  ],
  newsLens: `Frame each scenario in raw price action: supply/demand zones tested, swing levels broken or held, candle reactions.`,
  newsHorizon: 'hours',
  cardFields: [
    {
      id: 'supply_zones',
      label: 'Supply Zones',
      kind: 'level-list',
      tone: 'rose',
      count: 3,
    },
    {
      id: 'demand_zones',
      label: 'Demand Zones',
      kind: 'level-list',
      tone: 'emerald',
      count: 3,
    },
    { id: 'entry_setup', label: 'Entry Setup', kind: 'text-line' },
    { id: 'invalidation', label: 'Invalidation', kind: 'text-line' },
  ],
  quickPrompts: [
    {
      label: 'Active zones',
      prompt: 'List the active supply and demand zones on [pair]. Which one is closest to current price?',
    },
    {
      label: 'Daily candle',
      prompt: 'Read the most recent daily candle on [pair]. What is the structural read — engulfing, rejection, inside bar, breaker?',
    },
    {
      label: 'Swing structure',
      prompt: 'What is the swing structure on [pair] right now? HH/HL uptrend, LH/LL downtrend, or sideways?',
    },
    {
      label: 'Range bounds',
      prompt: 'Is [pair] in a range? Where are the bounds and is it nearing one?',
    },
  ],
}
