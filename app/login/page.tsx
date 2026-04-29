'use client'

import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login, resendVerification } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? ''
  const resetSuccess = searchParams.get('reset') === 'success'

  const [error, setError] = useState<string | null>(null)
  const [resendMsg, setResendMsg] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleLogin(formData: FormData) {
    setError(null)
    formData.set('redirect', redirectTo)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleResend() {
    setResendMsg(null)
    const fd = new FormData()
    fd.set('email', email)
    startTransition(async () => {
      const result = await resendVerification(fd)
      if (result?.message) setResendMsg(result.message)
    })
  }

  return (
    <AuthShell
      image="/pic/denaro-login.png"
      imageAlt="Denaro presenting the access hologram"
      badge="// IDENTITY ▸ VERIFY"
      title="Access Portal"
      subtitle="Authenticate to enter the Denaro grid."
      routeCode=">> /AUTH/LOGIN"
      formY="50%"
      footer={
        <p className="text-center text-xs tracking-wide">
          No clearance yet?{' '}
          <Link href="/register" className="font-semibold text-amber-300 hover:text-amber-200">
            Request access
          </Link>
        </p>
      }
    >
      {resetSuccess && (
        <div className="denaro-banner denaro-banner-success mb-4">
          Password updated. You can sign in now.
        </div>
      )}

      <form action={handleLogin} className="space-y-4">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@denaro.io"
            className="denaro-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="denaro-label">
              Passkey
            </label>
            <Link
              href="/forgot-password"
              className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/70 hover:text-cyan-100"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="••••••••••"
            className="denaro-input"
          />
        </div>

        {error && (
          <div className="denaro-banner denaro-banner-error">{error}</div>
        )}

        <button type="submit" disabled={isPending} className="denaro-btn">
          {isPending ? 'Authenticating…' : 'Engage'}
        </button>
      </form>

      <div className="mt-5 border-t border-cyan-400/15 pt-4">
        <p className="text-[0.7rem] tracking-wide text-cyan-100/60">
          Need to verify your link?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending || !email}
            className="font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-40"
          >
            Resend verification
          </button>
        </p>
        {resendMsg && (
          <p className="mt-2 text-[0.7rem] text-emerald-300/80">{resendMsg}</p>
        )}
      </div>
    </AuthShell>
  )
}
