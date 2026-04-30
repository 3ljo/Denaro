import { createClient } from '@/lib/supabase/server'
import { VISION_SYSTEM_PROMPT } from '@/lib/denaro/structured-analysis'
import { resolveLocale } from '@/i18n/request'
import { getVisionLanguageInstruction } from '@/lib/i18n/language-instruction'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILES = 3
const MAX_BYTES_PER_FILE = 6 * 1024 * 1024 // 6MB; OpenAI vision caps single images around there

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })
  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY missing', { status: 500 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return new Response('invalid form data', { status: 400 })
  }

  const files = form
    .getAll('charts')
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES)

  if (files.length === 0) return new Response('no files', { status: 400 })
  for (const f of files) {
    if (!f.type.startsWith('image/')) {
      return new Response(`only images allowed (${f.name})`, { status: 400 })
    }
    if (f.size > MAX_BYTES_PER_FILE) {
      return new Response(`${f.name} too large (max 6MB)`, { status: 400 })
    }
  }

  const note = (form.get('note') ?? '').toString().slice(0, 500)

  // Convert each image to a base64 data URL for OpenAI vision.
  const imageUrls = await Promise.all(
    files.map(async (f) => {
      const buf = await f.arrayBuffer()
      const b64 = Buffer.from(buf).toString('base64')
      return `data:${f.type};base64,${b64}`
    }),
  )

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const locale = await resolveLocale()
  const systemContent = VISION_SYSTEM_PROMPT + getVisionLanguageInstruction(locale)

  const userText =
    `Analyze these ${files.length} chart screenshot(s), ordered highest TF to lowest.` +
    (note ? ` Operator note: ${note}` : '')

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            ...imageUrls.map(
              (url) => ({ type: 'image_url' as const, image_url: { url } }),
            ),
          ],
        },
      ],
      max_tokens: 600,
      temperature: 0.55,
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
          console.error('denaro vision stream', err)
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
