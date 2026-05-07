import type { StrategyDefinition } from './types'

export const MEAN_REVERSION: StrategyDefinition = {
  id: 'mean-reversion',
  tier: 'pro',
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
  visionStack: ['1h', '30m', '15m'],
  visionBlurb:
    'Maps the range bounds, mean, and exhaustion signals — and returns the fade entry plus what breaks the range.',
  cardFields: [
    {
      id: 'range_high',
      label: 'Range High / Fade',
      kind: 'level-list',
      tone: 'rose',
      count: 2,
    },
    {
      id: 'range_low',
      label: 'Range Low / Fade',
      kind: 'level-list',
      tone: 'emerald',
      count: 2,
    },
    { id: 'fade_setup', label: 'Fade Setup', kind: 'text-line' },
    { id: 'invalidation', label: 'Range Break Invalidation', kind: 'text-line' },
  ],
  quickPrompts: [
    {
      label: 'Range bounds',
      prompt: 'Is [pair] in a range? Identify range high, range low, and the mean.',
    },
    {
      label: 'Exhaustion at edge',
      prompt: 'Is [pair] showing exhaustion at a range bound? Rejection wick, divergence, RSI extreme, double top/bottom?',
    },
    {
      label: 'Fade or chase',
      prompt: 'Is the current move on [pair] a fade opportunity or trend continuation? Which framing fits and why?',
    },
    {
      label: 'Time the bounce',
      prompt: 'On [pair], where is the next mean-reversion entry? Range edge trigger, mean target, invalidation level.',
    },
  ],
}
