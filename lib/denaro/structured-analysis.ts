import { STRATEGY_LABEL, type Strategy } from '@/lib/profile/types'
import type { SpotPrice } from '@/lib/market/price'

/**
 * System prompt for the dashboard pair cards. Returns a single JSON object
 * matching the Card schema below — never markdown, never prose outside JSON.
 */
export const CARD_SYSTEM_PROMPT = `You are Denaro, a senior trading analyst returning a single JSON object describing a trading instrument for a dashboard card.

Return ONLY valid JSON matching this schema (no markdown, no prose outside JSON):
{
  "bias": "bullish" | "bearish" | "range",
  "summary": string  // one punchy sentence (~14 words)
  "key_supports": string[]  // 2-3 levels with brief context, e.g. "2640 — daily demand + prior swing low"
  "key_resistances": string[]  // 2-3 levels with brief context
  "invalidation": string  // one sentence — what kills this bias
  "next_move": string  // one sentence — most probable next leg
  "confluence_score": integer  // 0-100, how many factors align (HTF bias, structure, level proximity, session, momentum)
}

Use trader vocabulary. Use the operator's chosen strategy lens. Probabilistic language only.`

/** Card type matching the JSON schema returned by the model. */
export type Card = {
  bias: 'bullish' | 'bearish' | 'range'
  summary: string
  key_supports: string[]
  key_resistances: string[]
  invalidation: string
  next_move: string
  confluence_score: number
}

export function buildCardPrompt(
  pair: string,
  strategy: Strategy,
  dateISO: string,
  spot?: SpotPrice,
) {
  const lens = STRATEGY_LABEL[strategy]

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

Return the JSON card.`
}

/**
 * Vision system prompt — for chart screenshot analysis. Output is plain text
 * (streamed), not JSON, since the operator reads it conversationally.
 */
export const VISION_SYSTEM_PROMPT = `You are Denaro reading chart screenshots. The operator uploads 1-3 charts in highest-to-lowest timeframe order (e.g. 4H → 1H → 15M).

Return a concise structural read in this exact form (markdown-light, max 220 words total):

**HTF Bias**
1-2 sentences from the highest TF.

**Key Levels**
- Bullet each level you see marked or implied.

**Entry Zone (lowest TF)**
1-2 sentences describing the operator's most probable entry window.

**Bias Direction**
One word + one-sentence reason.

**Invalidation**
One sentence — what kills this setup.

Use trader vocabulary. Probabilistic language only. No fluff.`
