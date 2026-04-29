import { createClient } from '@/lib/supabase/server'
import {
  CARD_SYSTEM_PROMPT,
  buildCardPrompt,
  type Card,
} from '@/lib/denaro/structured-analysis'
import { isStrategy } from '@/lib/profile/types'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY missing', { status: 500 })
  }

  let body: { pair?: string; strategy?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  const pair = (body.pair ?? '').toUpperCase().trim()
  if (!pair) return new Response('missing pair', { status: 400 })
  const strategy = isStrategy(body.strategy) ? body.strategy : 'smc'
  const today = new Date().toISOString().slice(0, 10)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CARD_SYSTEM_PROMPT },
        { role: 'user', content: buildCardPrompt(pair, strategy, today) },
      ],
      max_tokens: 600,
      temperature: 0.55,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    // Validate it parses; if not, return a 502 so the UI can show an error.
    try {
      JSON.parse(text) as Card
    } catch {
      return new Response('invalid model output', { status: 502 })
    }

    return new Response(text, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500
    const msg = (err as { message?: string })?.message ?? 'openai error'
    return new Response(msg, { status })
  }
}
