import type { StrategyDefinition } from './types'

export const SMC: StrategyDefinition = {
  id: 'smc',
  tier: 'free',
  chatLens: `Operator's lens: Smart Money Concepts. Anchor reads in HTF (D1/H4) bias, mid-frame structure (H1/M15), entry on M15/M5. Vocabulary: BoS, CHoCH, OB, FVG, liquidity sweep, mitigation, premium/discount, equal highs/lows. Look for swept liquidity, imbalances, displacement candles. Ignore classical trendlines, MAs, RSI/MACD unless the operator explicitly asks. Invalidation = clean structural break against bias. Probabilistic language only.`,
  cardLens: `Frame the read in SMC vocabulary: BoS, CHoCH, order blocks, FVGs, liquidity sweeps, premium/discount. Levels should reflect smart-money zones (OBs, FVG highs/lows, swept pools), not classical S/R lines.`,
  visionLens: `Operator picked Smart Money Concepts. Read every section through that lens — order blocks, FVGs, liquidity sweeps, mitigations, displacement, premium/discount. Avoid classical trendline / MA / RSI commentary.`,
  visionSections: [
    {
      heading: 'HTF Bias',
      instruction: '1-2 sentences from the highest TF — structural state (BoS / CHoCH / range), dominant order flow, premium vs discount.',
    },
    {
      heading: 'Key Levels',
      instruction: '- Bullet each level visible (price + 2-4 word context, e.g. "4612 — H4 OB" or "4595 — swept low"). Highlight order blocks, FVGs, and liquidity pools.',
    },
    {
      heading: 'Entry Zone',
      instruction: '1-2 sentences — where the SMC trigger forms on the LTF: mitigation tap, FVG fill, sweep + reclaim, or displacement off an OB.',
    },
    {
      heading: 'Bias',
      instruction: 'ONE word: BULLISH, BEARISH, or NEUTRAL. Then one sentence justification anchored in SMC structure.',
    },
    {
      heading: 'Invalidation',
      instruction: 'One sentence — clean structural break against bias (e.g. "close below H1 swing low at 4578 invalidates").',
    },
  ],
  newsLens: `Frame each scenario through SMC: a hot print sweeps liquidity at the prior high then mitigates lower, etc. Use BoS/CHoCH/OB/FVG/sweep vocabulary.`,
  newsHorizon: 'hours',
  cardFields: [
    {
      id: 'resistance_zones',
      label: 'Supply / OBs',
      kind: 'level-list',
      tone: 'rose',
      count: 3,
    },
    {
      id: 'demand_zones',
      label: 'Demand / OBs',
      kind: 'level-list',
      tone: 'emerald',
      count: 3,
    },
    { id: 'next_move', label: 'Next Probable Move', kind: 'text-line' },
    { id: 'invalidation', label: 'Structural Invalidation', kind: 'text-line' },
  ],
  quickPrompts: [
    {
      label: 'H4 sweep',
      prompt: 'What liquidity has H4 swept on [pair]? Identify the most recent sweep and what mitigation looks like next.',
    },
    {
      label: 'Unfilled FVGs',
      prompt: 'Map the unfilled FVGs on [pair] across H4 and H1. Which one is most likely to fill next?',
    },
    {
      label: 'Premium / discount',
      prompt: 'Is [pair] currently trading in premium or discount of the recent H4 dealing range? Where is the equilibrium?',
    },
    {
      label: 'BoS or CHoCH',
      prompt: 'Read the most recent H1 structural shift on [pair]. BoS, CHoCH, or just retracement?',
    },
  ],
}
