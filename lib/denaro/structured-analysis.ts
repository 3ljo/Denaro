import { STRATEGY_LABEL, type Strategy } from '@/lib/profile/types'
import { getStrategyDef } from '@/lib/denaro/strategies'
import type { SpotPrice } from '@/lib/market/price'

// Card system prompt is now built per-strategy in
// `lib/denaro/strategies/index.ts` as `buildCardSystemPrompt(strategy)` —
// the JSON schema lists the strategy's own field ids (e.g. SMC returns
// "resistance_zones", Trend returns "pullback_zones") so the model output
// matches what `pair-card.tsx` renders for that strategy.

/**
 * Card type returned by /api/denaro/card. Bias / summary / confluence_score
 * are common to every strategy. The `fields` map holds the strategy-specific
 * level lists and text lines — keys are defined in the strategy's
 * `cardFields` array (lib/denaro/strategies/<id>.ts) and the renderer in
 * `pair-card.tsx` looks them up by id.
 */
export type Card = {
  bias: 'bullish' | 'bearish' | 'range'
  summary: string
  confluence_score: number
  fields: Record<string, string | string[]>
}

export function buildCardPrompt(
  pair: string,
  strategy: Strategy,
  dateISO: string,
  spot?: SpotPrice,
) {
  const lens = STRATEGY_LABEL[strategy]
  const def = getStrategyDef(strategy)

  // CRITICAL: pass the live price into the prompt, otherwise the model
  // anchors levels to whatever range was current in its training data
  // (e.g. citing 2000 for XAUUSD when spot is actually 4500+).
  const liveBlock =
    spot && spot.price != null
      ? `\n\nLIVE MARKET DATA (USE THIS — DO NOT USE TRAINING-DATA PRICES):
- ${pair} spot price: ${spot.price}
- Previous close: ${spot.prev ?? 'n/a'}
- Day change: ${spot.changePercent != null ? spot.changePercent.toFixed(2) + '%' : 'n/a'}
- Data fetched: ${spot.asOf}

HARD CONSTRAINT: every support, resistance, and invalidation level you return
MUST sit within ±8% of the live price ${spot.price}. Levels outside that band
are wrong and will be rejected. If you find yourself citing a level from a
prior price era, replace it.`
      : `\n\nLIVE MARKET DATA: unavailable. Acknowledge this in the summary
("levels approximate — live data unavailable") and use conservative estimates.`

  return `Analyze ${pair} from a ${lens} perspective. Today is ${dateISO}.${liveBlock}

STRATEGY LENS:
${def.cardLens}

Return the JSON card.`
}

// Vision system prompt now lives in `lib/denaro/strategies/index.ts` as
// `buildVisionSystemPrompt(strategy)` — section headers and the lens block
// vary per strategy. The base wrapper keeps `**Bias**` and `**Key Levels**`
// section names intact so the FormattedAnalysis client parser still picks
// up the BULL/BEAR pill and gold price formatting.
