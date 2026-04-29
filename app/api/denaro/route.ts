import { createClient } from '@/lib/supabase/server'
import { DENARO_SYSTEM_PROMPT } from '@/lib/denaro/system-prompt'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: Request) {
  // Auth gate — Denaro is operator-only.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('unauthorized', { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY is not configured', { status: 500 })
  }

  let body: { messages?: ChatMessage[] }
  try {
    body = await req.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  const incoming = Array.isArray(body.messages) ? body.messages : []
  const safeMessages = incoming
    .filter(
      (m): m is ChatMessage =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    )
    // Cap conversation length to keep token usage predictable.
    .slice(-30)

  if (safeMessages.length === 0) {
    return new Response('no messages', { status: 400 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: DENARO_SYSTEM_PROMPT },
        ...safeMessages,
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(encoder.encode(text))
          }
        } catch (err) {
          console.error('denaro stream error', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500
    const msg = (err as { message?: string })?.message ?? 'openai error'
    return new Response(msg, { status })
  }
}
