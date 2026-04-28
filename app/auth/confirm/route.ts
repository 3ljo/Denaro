import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// =====================================================================
// /auth/confirm — handles links from Supabase emails
// =====================================================================
// When a user clicks a verification or password-reset link in their email,
// they land here with ?token_hash=...&type=...&next=...
//
// We verify the token, which:
//   - For type='signup': marks email_confirmed_at and creates a session.
//   - For type='recovery': creates a recovery-typed session that allows
//     password update.
//
// On success we redirect to `next` (or /dashboard).
// On failure we redirect to /auth/error.
//
// SECURITY: The token_hash is single-use and short-lived. Supabase
// invalidates it after first use, so even if it's logged somewhere it
// can't be replayed.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Only allow internal redirects — never external URLs
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  const supabase = await createClient()

  // Two flows arrive here:
  //   1. PKCE flow (default with @supabase/ssr + the default email template):
  //      the link comes back as ?code=<pkce_code> and we exchange it for a session.
  //   2. OTP flow (used when the email template is customized to pass
  //      {{ .TokenHash }} directly): ?token_hash=&type=, verified via verifyOtp.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(
        new URL(`/auth/error?reason=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) {
      console.error('verifyOtp error:', error.message)
      return NextResponse.redirect(
        new URL(`/auth/error?reason=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  return NextResponse.redirect(new URL('/auth/error', request.url))
}
