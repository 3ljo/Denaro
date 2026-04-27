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
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
      else if (result?.message) setSuccessMsg(result.message)
    })
  }

  if (successMsg) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Check your inbox</h1>
          <p className="text-sm text-neutral-600">{successMsg}</p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-neutral-900 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-neutral-600">
            We&apos;ll email you to verify it&apos;s really you.
          </p>
        </div>

        <form action={handleRegister} className="space-y-4">
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
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
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
              minLength={12}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              At least 12 characters, with letters and numbers.
            </p>
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
