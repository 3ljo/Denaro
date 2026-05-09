import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `You are the Denaro help assistant for the Denaro website (denaro-one.vercel.app).

Denaro is an AI trading analyst app: multi-timeframe market reads, live news, vision-based chart analysis, and a 24/7 chat that thinks in the user's chosen strategy. Main pages: sign in, sign up, pricing, dashboard, settings, strategies.

ONLY answer questions about the Denaro website — its features, pricing, account, or how to use it. If asked anything off-topic (general knowledge, trading advice, other apps), politely say you can only help with questions about Denaro.

Keep answers short: 1-3 sentences. Friendly and direct.`

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY not configured', { status: 500 })
  }

  let body: { messages?: ChatMessage[] }
  try {
    body = await req.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is ChatMessage =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .slice(-10)

  if (messages.length === 0) {
    return new Response('no messages', { status: 400 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 300,
      temperature: 0.5,
    })
    const reply = res.choices[0]?.message?.content ?? ''
    return Response.json({ reply })
  } catch (err) {
    console.error('help chat error', err)
    return new Response('upstream error', { status: 502 })
  }
}
