'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login, resendVerification } from '@/lib/auth/actions'

export default function LoginPage() {
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
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Welcome back. Enter your details below.
          </p>
        </div>

        {resetSuccess && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Password updated. You can sign in now.
          </div>
        )}

        <form action={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-neutral-600 hover:text-neutral-900"
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
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Always-visible resend option — avoids leaking that an account is unverified */}
        <div className="border-t border-neutral-200 pt-4">
          <p className="text-xs text-neutral-600">
            Need to verify your email?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isPending || !email}
              className="font-medium text-neutral-900 hover:underline disabled:opacity-50"
            >
              Resend verification
            </button>
          </p>
          {resendMsg && (
            <p className="mt-2 text-xs text-green-700">{resendMsg}</p>
          )}
        </div>

        <p className="text-center text-sm text-neutral-600">
          No account?{' '}
          <Link href="/register" className="font-medium text-neutral-900 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
