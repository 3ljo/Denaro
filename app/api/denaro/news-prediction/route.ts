import { createClient } from '@/lib/supabase/server'
import { resolveLocale } from '@/i18n/request'
import { getChatLanguageInstruction } from '@/lib/i18n/language-instruction'
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

const SYSTEM_PROMPT = `You are Denaro, an AI trading analyst.

The user is watching a market pair and is about to face a high-impact economic release. Give a short, professional read of what the event could do to the pair if the print comes in HOT (above forecast), COLD (below forecast), or IN-LINE.

Style:
- 3 short bullet points, one per scenario (HOT / COLD / IN-LINE).
- Each bullet: max 2 sentences, plain English, no hedging fluff.
- Mention likely directional bias on the requested pair, what level/zone to watch, and one concrete behavior to look for (impulse vs fade, retest, sweep).
- Never give explicit "buy" or "sell" calls. This is analysis, not advice.
- No preamble, no disclaimer at the end. Lead straight with the bullets.

Format exactly:
HOT (above forecast): <line>
COLD (below forecast): <line>
IN-LINE: <line>`

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

  const userPrompt = [
    `Pair the user is watching: ${pair}`,
    `Event: ${title}`,
    currency ? `Event currency: ${currency}` : null,
    body.forecast ? `Consensus forecast: ${body.forecast}` : null,
    body.previous ? `Previous reading: ${body.previous}` : null,
    body.timeIso ? `Scheduled time (UTC): ${body.timeIso}` : null,
    '',
    'Give the 3-bullet read in the format above.',
  ]
    .filter(Boolean)
    .join('\n')

  const locale = await resolveLocale()
  const langSuffix = getChatLanguageInstruction(locale)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + langSuffix },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 220,
      temperature: 0.4,
    })
    const text = completion.choices[0]?.message?.content?.trim() ?? ''
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500
    const msg = (err as { message?: string })?.message ?? 'openai error'
    return new Response(msg, { status })
  }
}
