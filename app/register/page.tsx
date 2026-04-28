'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { register } from '@/lib/auth/actions'

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
      <main className="flex min-h-dvh items-center justify-center px-4 py-8 safe-top safe-bottom">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold">Check your inbox</h1>
          <p className="text-sm text-neutral-600">{successMsg}</p>
          <Link
            href="/login"
            className="inline-block py-2 text-sm font-medium text-neutral-900 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-neutral-600">
            We&apos;ll email you to verify it&apos;s really you.
          </p>
        </div>

        <form action={handleRegister} noValidate className="space-y-4">
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
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
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
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-neutral-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              At least 6 characters.
            </p>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium">
              Repeat password
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
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 active:bg-neutral-700 disabled:opacity-50"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
