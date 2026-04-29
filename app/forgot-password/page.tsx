'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result?.message) setMessage(result.message)
    })
  }

  return (
    <AuthShell
      image="/pic/denaro-login.png"
      imageAlt="Denaro recovering the access hologram"
      badge="// KEY ▸ RECOVER"
      title="Reset Passkey"
      subtitle="Enter your email and we’ll transmit a recovery link."
      routeCode=">> /AUTH/RECOVER"
      formY="50%"
      footer={
        <p className="text-center text-xs tracking-wide">
          <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
            ← Back to access portal
          </Link>
        </p>
      }
    >
      {message ? (
        <div className="denaro-banner denaro-banner-success">{message}</div>
      ) : (
        <form action={handleSubmit} className="space-y-4">
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

          <button type="submit" disabled={isPending} className="denaro-btn">
            {isPending ? 'Transmitting…' : 'Send Recovery Link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
