'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { register } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRegister(formData: FormData) {
    setError(null)
    setSuccessMsg(null)

    const email = (formData.get('email') as string ?? '').trim()
    const password = (formData.get('password') as string) ?? ''
    const confirm = (formData.get('confirm') as string) ?? ''

    if (!email) {
      setError('Please enter your email')
      return
    }
    if (!password) {
      setError('Please enter a password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
      else if (result?.message) setSuccessMsg(result.message)
    })
  }

  if (successMsg) {
    return (
      <AuthShell
        image="/pic/denaro-verify.png"
        imageAlt="Denaro inspecting the verification hologram"
        badge="// LINK ▸ DISPATCHED"
        title="Verify Inbox"
        subtitle="Your verification link has been transmitted."
        routeCode=">> /AUTH/VERIFY"
        formY="46%"
        footer={
          <p className="text-center text-xs tracking-wide">
            <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
              ← Back to access portal
            </Link>
          </p>
        }
      >
        <div className="denaro-banner denaro-banner-success">{successMsg}</div>
        <p className="mt-4 text-xs tracking-wide text-cyan-100/60">
          Check spam or junk if it doesn&apos;t arrive in a minute. The link is valid for a single use.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      image="/pic/denaro.png"
      imageAlt="Denaro standing ready"
      badge="// PROFILE ▸ INITIALIZE"
      title="New Operator"
      subtitle="Register to receive a Denaro identity."
      routeCode=">> /AUTH/REGISTER"
      formY="46%"
      footer={
        <p className="text-center text-xs tracking-wide">
          Already onboard?{' '}
          <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
            Sign in
          </Link>
        </p>
      }
    >
      <form action={handleRegister} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="denaro-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="operator@denaro.io"
            className="denaro-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="denaro-label">
            Passkey
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            minLength={6}
            placeholder="•••••• minimum 6"
            className="denaro-input"
          />
          <p className="mt-1.5 text-[0.65rem] tracking-wide text-cyan-100/45">
            Minimum 6 characters. Mix it up.
          </p>
        </div>

        <div>
          <label htmlFor="confirm" className="denaro-label">
            Confirm Passkey
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            minLength={6}
            placeholder="repeat passkey"
            className="denaro-input"
          />
        </div>

        {error && (
          <div className="denaro-banner denaro-banner-error">{error}</div>
        )}

        <button type="submit" disabled={isPending} className="denaro-btn">
          {isPending ? 'Compiling…' : 'Create Identity'}
        </button>
      </form>
    </AuthShell>
  )
}
