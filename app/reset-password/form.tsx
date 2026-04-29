'use client'

import { useState, useTransition } from 'react'
import { resetPassword } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)

    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <AuthShell
      image="/pic/denaro-recover.png"
      imageAlt="Denaro encoding a new key"
      badge="// KEY ▸ REFORGE"
      title="New Passkey"
      subtitle="Choose a strong key you haven’t used before."
      routeCode=">> /AUTH/RECOVER/RESET"
      formY="46%"
    >
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="denaro-label">
            New Passkey
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
          {isPending ? 'Reforging…' : 'Update Passkey'}
        </button>
      </form>
    </AuthShell>
  )
}
