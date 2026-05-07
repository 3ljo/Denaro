import { createClient } from '@/lib/supabase/server'
import { getOperatorStrategy } from '@/lib/profile/get-strategy'
import { getStrategyDef, getNewsHorizonPhrase } from '@/lib/denaro/strategies'
import { resolveLocale } from '@/i18n/request'
import { getChatLanguageInstruction } from '@/lib/i18n/language-instruction'
import { fetchSpotPrice } from '@/lib/market/price'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  pair?: string
  title?: string
  currency?: string
  impact?: 'high' | 'medium' | 'low'
  forecast?: string
  previous?: string
  /** ISO time of the event */
  timeIso?: string
}

function buildSystemPrompt(horizonPhrase: string, lens: string): string {
  return `You are Denaro, an AI trading analyst.

The user is watching a market pair and is about to face a high-impact economic release. Return a strict JSON object with exactly three keys: "hot", "cold", "inline". Each value is one short reaction sentence describing what happens to THE USER'S PAIR over ${horizonPhrase} if the print comes in above forecast (hot), below forecast (cold), or matches it (inline).

Hard rules — every sentence MUST satisfy ALL of these:
1. Begin with "Bullish <pair-short>" / "Bearish <pair-short>" / "Range <pair-short>".
2. Include ONE concrete numeric level or zone derived from the LIVE SPOT PRICE the user provides. Levels must sit within ±5% of that spot. NEVER invent levels from training data.
3. End with one setup keyword: impulse, fade, retest, sweep, breakout, reclaim, continuation, or rejection.
4. Max 14 words. Direct trader voice. No "could / may / potential / likely / watch for / consider / if" hedging.
5. No preamble, no disclaimer, no "buy" or "sell" calls. Describe the pair's reaction, not what the trader should do.

STRATEGY LENS:
${lens}

Output JSON shape (no other keys, no markdown, no commentary):
{"hot": "...", "cold": "...", "inline": "..."}

If no spot price is provided, write the level as "[level]" — do NOT make one up.`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY missing', { status: 500 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  const pair = (body.pair ?? '').toUpperCase().trim()
  const title = (body.title ?? '').trim()
  const currency = (body.currency ?? '').toUpperCase().trim()
  if (!pair || !title) return new Response('missing pair or title', { status: 400 })
  if (body.impact !== 'high') {
    return new Response('predictions are only enabled for high-impact events', { status: 400 })
  }

  // Anchor the model to the actual live price so it doesn't hallucinate
  // levels from outdated training data.
  const spot = await fetchSpotPrice(pair).catch(() => null)
  const spotLine =
    spot && spot.price != null
      ? `LIVE SPOT PRICE for ${pair}: ${spot.price} (as of ${spot.asOf}).`
      : `LIVE SPOT PRICE for ${pair}: unavailable — write the level as "[level]" rather than invent one.`

  const userPrompt = [
    spotLine,
    '',
    `Pair the user is watching: ${pair}`,
    `Event: ${title}`,
    currency ? `Event currency: ${currency}` : null,
    body.forecast ? `Consensus forecast: ${body.forecast}` : null,
    body.previous ? `Previous reading: ${body.previous}` : null,
    body.timeIso ? `Scheduled time (UTC): ${body.timeIso}` : null,
    '',
    'Write the 3 lines now. Levels MUST sit within ±5% of the live spot above.',
  ]
    .filter(Boolean)
    .join('\n')

  const locale = await resolveLocale()
  const langSuffix = getChatLanguageInstruction(locale)

  const strategy = await getOperatorStrategy()
  const def = getStrategyDef(strategy)
  const systemPrompt = buildSystemPrompt(getNewsHorizonPhrase(strategy), def.newsLens)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt + langSuffix },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? '{}'
    let parsed: { hot?: unknown; cold?: unknown; inline?: unknown } = {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      return new Response('invalid model output', { status: 502 })
    }

    const hot = typeof parsed.hot === 'string' ? parsed.hot.trim() : ''
    const cold = typeof parsed.cold === 'string' ? parsed.cold.trim() : ''
    const inline = typeof parsed.inline === 'string' ? parsed.inline.trim() : ''
    if (!hot || !cold || !inline) {
      return new Response('incomplete model output', { status: 502 })
    }

    // Re-stringify into the exact format the client parser already understands.
    const text = `HOT: ${hot}\nCOLD: ${cold}\nIN-LINE: ${inline}`
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500
    const msg = (err as { message?: string })?.message ?? 'openai error'
    return new Response(msg, { status })
  }
}
