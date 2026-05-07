import type { StrategyDefinition } from './types'

export const MEAN_REVERSION: StrategyDefinition = {
  id: 'mean-reversion',
  tier: 'free',
  chatLens: `Operator's lens: Mean Reversion. Only fade extremes within established ranges — never inside a trending impulse. Anchor in H1/M15 range identification. Look for exhaustion at range bounds: rejection wicks, RSI overbought/oversold, divergence, double tops/bottoms. Vocabulary: range high, range low, mean, exhaustion, fade, divergence, return-to-mean. Avoid breakout/momentum framing. Invalidation = clean break + close outside the range.`,
  cardLens: `Frame the read in mean-reversion terms: range high, range low, mean, exhaustion zones at extremes, fade entries. If price is trending (no range), say so explicitly — don't force a fade thesis.`,
  visionLens: `Operator picked Mean Reversion. Read every section through that lens — range bounds, exhaustion, fades. If the chart is clearly trending without a range, acknowledge that and warn against forcing a fade.`,
  visionSections: [
    {
      heading: 'Range State',
      instruction: '1-2 sentences — established range, expanding range, or no range present. HTF context. If trending, say so explicitly.',
    },
    {
      heading: 'Key Levels',
      instruction: '- Bullet each level visible (price + 2-4 word context, e.g. "4612 — range high" or "4580 — range low" or "4596 — mean"). Range high, range low, mean, exhaustion zones.',
    },
    {
      heading: 'Fade Setup',
      instruction: '1-2 sentences — exhaustion signal at the range bound: rejection wick, divergence, RSI extreme, double top/bottom on the LTF.',
    },
    {
      heading: 'Bias',
      instruction: 'ONE word: BULLISH (fade range low), BEARISH (fade range high), or NEUTRAL (no fade). Then one sentence justification.',
    },
    {
      heading: 'Invalidation',
      instruction: 'One sentence — clean break + close outside the range invalidates the fade.',
    },
  ],
  newsLens: `Frame each scenario as range continuation or range break. Hot may extend the range or break it — say which and where.`,
  newsHorizon: 'hours',
}
