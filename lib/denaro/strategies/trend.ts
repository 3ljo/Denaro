import type { StrategyDefinition } from './types'

export const TREND: StrategyDefinition = {
  id: 'trend',
  tier: 'pro',
  chatLens: `Operator's lens: Trend Following. Anchor in H4/H1 trend definition, M30/M15 pullback entry. Look for pullbacks to dynamic support (EMA cluster, prior swing), continuation patterns (bull/bear flags, breakout retests), momentum candles. Vocabulary: HH/HL or LH/LL, breakout retest, momentum, EMA stack, continuation, pullback. Ignore counter-trend reversal setups and range-fade ideas. Invalidation = lower-low (in uptrend) or higher-high (in downtrend) print on the entry timeframe.`,
  cardLens: `Frame the read in trend-following terms: trend phase (impulse / correction / exhaustion), pullback zones, breakout retest levels, continuation triggers. No fade/reversal framing unless the trend is clearly broken.`,
  visionLens: `Operator picked Trend Following. Read every section through that lens — trend phase, pullback zones, continuation triggers. Avoid counter-trend fade ideas; if the trend is unclear, say so.`,
  visionSections: [
    {
      heading: 'Trend Phase',
      instruction: '1-2 sentences — current trend state on HTF: impulse, correction, exhaustion, or no-trend. Reference HH/HL or LH/LL prints.',
    },
    {
      heading: 'Key Levels',
      instruction: '- Bullet each level visible (price + 2-4 word context, e.g. "4612 — pullback to 4H swing" or "4640 — breakout retest"). Pullback zones, breakout retests, continuation triggers.',
    },
    {
      heading: 'Continuation Trigger',
      instruction: '1-2 sentences — what confirms continuation on the LTF: pullback rejection, breakout + retest hold, momentum candle off the pullback.',
    },
    {
      heading: 'Bias',
      instruction: 'ONE word: BULLISH, BEARISH, or NEUTRAL. Then one sentence justification anchored in the trend phase.',
    },
    {
      heading: 'Invalidation',
      instruction: 'One sentence — opposite-side LL (in uptrend) or HH (in downtrend) print on the entry TF kills the continuation thesis.',
    },
  ],
  newsLens: `Frame each scenario as continuation vs reversal of the prevailing trend. Hot may extend the trend or trigger a reversal — say which.`,
  newsHorizon: 'hours',
  visionStack: ['4h', '1h', '15m'],
  cardFields: [
    {
      id: 'breakout_retests',
      label: 'Breakout Retests',
      kind: 'level-list',
      tone: 'amber',
      count: 3,
    },
    {
      id: 'pullback_zones',
      label: 'Pullback Zones',
      kind: 'level-list',
      tone: 'cyan',
      count: 3,
    },
    { id: 'continuation_trigger', label: 'Continuation Trigger', kind: 'text-line' },
    { id: 'invalidation', label: 'Trend Invalidation', kind: 'text-line' },
  ],
  quickPrompts: [
    {
      label: 'Next pullback',
      prompt: 'On [pair], where is the next pullback zone in the prevailing trend? EMA cluster, prior swing, breakout retest?',
    },
    {
      label: 'Trend phase',
      prompt: 'What phase is the [pair] trend in? Impulse, correction, exhaustion, or no-trend?',
    },
    {
      label: 'Continuation trigger',
      prompt: 'What confirms continuation on [pair]? Pullback rejection, breakout + retest, momentum candle?',
    },
    {
      label: 'Trend strength',
      prompt: 'Rate trend strength on [pair] 1-10 and explain. HH/HL print history, momentum, EMA stack.',
    },
  ],
}
