import type { StrategyDefinition } from './types'

export const SCALPING: StrategyDefinition = {
  id: 'scalping',
  tier: 'free',
  chatLens: `Operator's lens: Scalping. Anchor on M5/M1 only — don't editorialize on D1/H4 macro unless using it as a session-bias filter. Look for fast momentum bursts, news spikes, micro-ranges, session opens/closes. Tight invalidation, 1:1 to 1:2 RR, hold horizon: minutes to hours, never days. Vocabulary: micro-range, push/pullback, micro-breakout, session high/low, liquidity grab, opening drive. No multi-day talk. Default to "no setup" if the chart is mid-session chop.`,
  cardLens: `Frame for scalping: micro-bias on M5/M1, session-relevant levels (session highs/lows, opening drives), tight invalidation. Levels should be intraday-relevant, not multi-day swing levels.`,
  visionLens: `Operator picked Scalping but the chart stack is fixed at 4H/1H/15M. Use 15M as the closest scalping anchor; explicitly note that M1/M5 trigger confirmation is required for an actual entry. Keep all reads intraday — no multi-day commentary.`,
  visionSections: [
    {
      heading: 'M15 Bias',
      instruction: '1-2 sentences — micro-bias on the lowest TF visible (15M as scalping proxy). Session context (London open, NY open, lunch chop, close).',
    },
    {
      heading: 'Key Levels',
      instruction: '- Bullet each intraday level (price + 2-4 word context, e.g. "4612 — session high" or "4604 — M15 swing"). Session highs/lows, opening drives, M15 swing levels, micro liquidity.',
    },
    {
      heading: 'Trigger',
      instruction: '1-2 sentences — exact intraday trigger to watch for on M5/M1: micro-breakout + retest, session-open spike fade, liquidity grab + reclaim.',
    },
    {
      heading: 'Bias',
      instruction: 'ONE word: BULLISH, BEARISH, or NEUTRAL. Then one sentence justification anchored intraday.',
    },
    {
      heading: 'Tight Invalidation',
      instruction: 'One sentence — tight stop: prior M15 swing or nearest micro level. Note rough pip distance (e.g. "8-15 pips for FX, 0.1% for indices/crypto").',
    },
  ],
  newsLens: `Frame each scenario as the IMMEDIATE next 30-60 minute reaction. Tight, fast, intraday — no multi-day talk.`,
  newsHorizon: 'minutes',
}
