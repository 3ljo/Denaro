'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// =====================================================================
// Validation
// =====================================================================
const PASSWORD_MIN_LENGTH = 6

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return 'Invalid email'
  const trimmed = email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(trimmed)) return 'Invalid email'
  if (trimmed.length > 254) return 'Email too long'
  return null
}

function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string') return 'Invalid password'
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  }
  if (password.length > 128) return 'Password too long'
  return null
}

// Build the absolute origin from the request headers.
// Used for emailRedirectTo / redirectTo links.
async function getOrigin(): Promise<string> {
  const h = await headers()
  // x-forwarded-host/proto for production behind a proxy (Vercel sets these)
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

// =====================================================================
// REGISTER
// =====================================================================
// Returns a generic message regardless of whether the email is new or
// already registered. This prevents account enumeration.
export async function register(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  const emailError = validateEmail(email)
  if (emailError) return { error: emailError }

  const passwordError = validatePassword(password)
  if (passwordError) return { error: passwordError }

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.signUp({
    email: (email as string).trim().toLowerCase(),
    password: password as string,
    options: {
      // Where Supabase sends the user after they click the email link.
      // /auth/confirm verifies the token, then redirects to /dashboard.
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  // Note: Supabase's signUp does NOT return an error if the email already
  // exists with the default settings (it sends a "you already have an
  // account" email instead, if configured, or just silently succeeds).
  // Either way, we always show the same message to the user.
  if (error) {
    // Log internally but don't leak details
    console.error('Register error:', error.message)
  }

  return {
    success: true,
    message:
      'If this email is new, check your inbox to verify your account. ' +
      'If you already have an account, you can log in.',
  }
}

// =====================================================================
// LOGIN
// =====================================================================
export async function login(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = formData.get('redirect')

  const emailError = validateEmail(email)
  if (emailError) return { error: 'Invalid email or password' }

  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Invalid email or password' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: (email as string).trim().toLowerCase(),
    password,
  })

  if (error) {
    // We deliberately collapse "wrong password", "no such user", and
    // "email not confirmed" into one generic message to prevent enumeration.
    // The trade-off: legitimate users who haven't verified see a confusing
    // error. We mitigate by including a "Resend verification" link on the
    // login page that they can click regardless.
    return { error: 'Invalid email or password, or email not yet verified' }
  }

  revalidatePath('/', 'layout')

  // Validate the redirect target is a safe internal path
  const safeRedirect =
    typeof redirectTo === 'string' &&
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard'

  redirect(safeRedirect)
}

// =====================================================================
// LOGOUT
// =====================================================================
// Calls Supabase to revoke the refresh token server-side, then clears cookies.
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// =====================================================================
// FORGOT PASSWORD
// =====================================================================
// Always returns success, even if the email doesn't exist. Prevents enumeration.
export async function forgotPassword(formData: FormData) {
  const email = formData.get('email')

  const emailError = validateEmail(email)
  if (emailError) {
    // Even on validation failure, return a generic message.
    return {
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    }
  }

  const supabase = await createClient()
  const origin = await getOrigin()

  // Note: Supabase's resetPasswordForEmail does not error for unknown emails.
  await supabase.auth.resetPasswordForEmail(
    (email as string).trim().toLowerCase(),
    {
      // The link in the email goes to /auth/confirm which validates the
      // token and then redirects to /reset-password where the user types
      // a new password.
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    }
  )

  return {
    success: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  }
}

// =====================================================================
// RESET PASSWORD
// =====================================================================
// This is called from the /reset-password page AFTER the user clicked the
// recovery email link. /auth/confirm has already verified the recovery
// token and given them a session. So at this point we have a valid logged-in
// user with a recovery-typed session, and we just update their password.
export async function resetPassword(formData: FormData) {
  const password = formData.get('password')

  const passwordError = validatePassword(password)
  if (passwordError) return { error: passwordError }

  const supabase = await createClient()

  // Make sure they actually have a session (i.e. they came from a valid
  // recovery link). If not, /auth/confirm would have rejected them.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Reset link is invalid or has expired. Please request a new one.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password as string,
  })

  if (error) {
    return { error: 'Could not update password. Please try again.' }
  }

  // Sign out everywhere else — kills any other sessions that may exist.
  // This is important: if an attacker had access via a stolen session,
  // changing the password should kick them out.
  await supabase.auth.signOut({ scope: 'others' })

  revalidatePath('/', 'layout')
  redirect('/login?reset=success')
}

// =====================================================================
// RESEND VERIFICATION EMAIL
// =====================================================================
export async function resendVerification(formData: FormData) {
  const email = formData.get('email')

  const emailError = validateEmail(email)
  if (emailError) {
    return {
      success: true,
      message: 'If your account needs verification, a new email has been sent.',
    }
  }

  const supabase = await createClient()
  const origin = await getOrigin()

  await supabase.auth.resend({
    type: 'signup',
    email: (email as string).trim().toLowerCase(),
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  return {
    success: true,
    message: 'If your account needs verification, a new email has been sent.',
  }
}
