'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/auth/actions'

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
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {message ? (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {message}
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 active:bg-neutral-700 disabled:opacity-50"
            >
              {isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-neutral-600">
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
