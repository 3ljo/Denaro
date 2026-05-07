'use server'

import { createClient } from '@/lib/supabase/server'

export type ContactErrorKey =
  | 'invalidName'
  | 'invalidEmail'
  | 'invalidMessage'
  | 'subjectTooLong'
  | 'sendFailed'

export type ContactResult =
  | { ok: true }
  | { ok: false; errorKey: ContactErrorKey }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  // Honeypot: real users leave this empty; bots fill it. Pretend success silently.
  const honeypot = String(formData.get('website') ?? '').trim()
  if (honeypot.length > 0) return { ok: true }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || name.length < 2 || name.length > 120) {
    return { ok: false, errorKey: 'invalidName' }
  }
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return { ok: false, errorKey: 'invalidEmail' }
  }
  if (subject.length > 200) {
    return { ok: false, errorKey: 'subjectTooLong' }
  }
  if (!message || message.length < 10 || message.length > 5000) {
    return { ok: false, errorKey: 'invalidMessage' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    subject: subject.slice(0, 200) || null,
    message,
    user_id: user?.id ?? null,
  })

  if (error) {
    console.error('[contact] insert failed:', error)
    return { ok: false, errorKey: 'sendFailed' }
  }

  return { ok: true }
}
