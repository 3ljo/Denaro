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

/** Server actions return translation KEYS, not raw strings — the client
 *  resolves them via next-intl so error/message text follows the user's locale. */
export type AuthErrorKey =
  | 'invalidEmail'
  | 'emailTooLong'
  | 'invalidPassword'
  | 'passwordTooShort'
  | 'passwordTooLong'
  | 'invalidCredentials'
  | 'invalidCredentialsOrUnverified'
  | 'resetExpired'
  | 'couldNotUpdatePassword'

export type AuthMessageKey = 'registerSent' | 'resetSent' | 'verificationSent'

function validateEmail(email: unknown): AuthErrorKey | null {
  if (typeof email !== 'string') return 'invalidEmail'
  const trimmed = email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(trimmed)) return 'invalidEmail'
  if (trimmed.length > 254) return 'emailTooLong'
  return null
}

function validatePassword(password: unknown): AuthErrorKey | null {
  if (typeof password !== 'string') return 'invalidPassword'
  if (password.length < PASSWORD_MIN_LENGTH) return 'passwordTooShort'
  if (password.length > 128) return 'passwordTooLong'
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
  if (emailError) return { errorKey: emailError as AuthErrorKey }

  const passwordError = validatePassword(password)
  if (passwordError) return { errorKey: passwordError as AuthErrorKey }

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

  return { success: true, messageKey: 'registerSent' as AuthMessageKey }
}

// =====================================================================
// LOGIN
// =====================================================================
export async function login(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = formData.get('redirect')

  const emailError = validateEmail(email)
  if (emailError) return { errorKey: 'invalidCredentials' as AuthErrorKey }

  if (typeof password !== 'string' || password.length === 0) {
    return { errorKey: 'invalidCredentials' as AuthErrorKey }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: (email as string).trim().toLowerCase(),
    password,
  })

  if (error) {
    // We deliberately collapse "wrong password", "no such user", and
    // "email not confirmed" into one generic message to prevent enumeration.
    return { errorKey: 'invalidCredentialsOrUnverified' as AuthErrorKey }
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
    return { success: true, messageKey: 'resetSent' as AuthMessageKey }
  }

  const supabase = await createClient()
  const origin = await getOrigin()

  // Note: Supabase's resetPasswordForEmail does not error for unknown emails.
  await supabase.auth.resetPasswordForEmail(
    (email as string).trim().toLowerCase(),
    {
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    }
  )

  return { success: true, messageKey: 'resetSent' as AuthMessageKey }
}

// =====================================================================
// RESET PASSWORD
// =====================================================================
export async function resetPassword(formData: FormData) {
  const password = formData.get('password')

  const passwordError = validatePassword(password)
  if (passwordError) return { errorKey: passwordError as AuthErrorKey }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { errorKey: 'resetExpired' as AuthErrorKey }

  const { error } = await supabase.auth.updateUser({
    password: password as string,
  })

  if (error) return { errorKey: 'couldNotUpdatePassword' as AuthErrorKey }

  // Sign out everywhere else — kills any other sessions that may exist.
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
    return { success: true, messageKey: 'verificationSent' as AuthMessageKey }
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

  return { success: true, messageKey: 'verificationSent' as AuthMessageKey }
}
