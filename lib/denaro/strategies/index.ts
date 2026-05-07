import type { Strategy } from '@/lib/profile/types'
import { isStrategy } from '@/lib/profile/types'
import type { StrategyDefinition } from './types'
import { SMC } from './smc'
import { PRICE_ACTION } from './price-action'
import { TREND } from './trend'
import { MEAN_REVERSION } from './mean-reversion'
import { SCALPING } from './scalping'
import { SWING } from './swing'

export type { StrategyDefinition, VisionSection, NewsHorizon, SubscriptionTier } from './types'

export const STRATEGY_REGISTRY: Record<Strategy, StrategyDefinition> = {
  'smc': SMC,
  'price-action': PRICE_ACTION,
  'trend': TREND,
  'mean-reversion': MEAN_REVERSION,
  'scalping': SCALPING,
  'swing': SWING,
}

export function getStrategyDef(strategy: Strategy): StrategyDefinition {
  return STRATEGY_REGISTRY[strategy]
}

// Tolerant lookup for unknown / null inputs (e.g. legacy profiles).
export function getStrategyDefSafe(value: unknown): StrategyDefinition {
  return STRATEGY_REGISTRY[isStrategy(value) ? value : 'smc']
}

// Builds the vision system prompt for a given strategy. The base wrapper
// stays constant so the FormattedAnalysis client parser keeps working; only
// the section list and the lens block vary per strategy.
export function buildVisionSystemPrompt(strategy: Strategy): string {
  const def = STRATEGY_REGISTRY[strategy]
  const sectionBlock = def.visionSections
    .map((s) => `**${s.heading}**\n${s.instruction}`)
    .join('\n\n')

  return `You are Denaro reading a multi-timeframe chart stack.

INPUT: 3 chart screenshots ordered highest TF to lowest. The user is on a fixed 4H / 1H / 15M stack.

OUTPUT: structured analysis using these EXACT section headers (one per line, surrounded by **). Leave a blank line between sections. Max 220 words total. No fluff, no preamble, no closing remarks.

${sectionBlock}

STRATEGY LENS:
${def.visionLens}

Use trader vocabulary. Probabilistic language only ("probable", "expected", "invalidation at"). Never "guaranteed" or "100%".`
}

// Maps the strategy's news-prediction horizon to a phrase that goes into the
// news-prediction system prompt — keeps a scalper getting next-30-min
// reactions and a swing trader getting next-1-2-week bias adjustments.
export function getNewsHorizonPhrase(strategy: Strategy): string {
  const horizon = STRATEGY_REGISTRY[strategy].newsHorizon
  switch (horizon) {
    case 'minutes':
      return 'the IMMEDIATE next 30-60 minute reaction'
    case 'hours':
      return 'the next several hours of price action'
    case 'days':
      return 'the next 1-3 days of bias adjustment'
    case 'weeks':
      return 'the next 1-2 weeks of bias adjustment'
  }
}
