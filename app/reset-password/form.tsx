'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { resetPassword } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'
import PasswordInput from '@/app/_components/password-input'

export default function ResetPasswordForm() {
  const t = useTranslations('auth.reset')
  const tErr = useTranslations('auth.errors')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)

    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.errorKey) setError(tErr(result.errorKey))
    })
  }

  return (
    <AuthShell
      image="/pic/denaro-login.png"
      imageAlt={t('imageAlt')}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
      routeCode={t('routeCode')}
      formY="50%"
    >
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="denaro-label">
            {t('newPasswordLabel')}
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoFocus
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            minLength={6}
            placeholder={t('newPasswordPlaceholder')}
            onChange={() => {
              if (error) setError(null)
            }}
          />
        </div>

        <div>
          <label htmlFor="confirm" className="denaro-label">
            {t('confirmLabel')}
          </label>
          <PasswordInput
            id="confirm"
            name="confirm"
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            minLength={6}
            placeholder={t('confirmPlaceholder')}
            onChange={() => {
              if (error) setError(null)
            }}
          />
        </div>

        {error && (
          <div className="denaro-banner denaro-banner-error">{error}</div>
        )}

        <button type="submit" disabled={isPending} className="denaro-btn">
          {isPending ? t('submitting') : t('submit')}
        </button>
      </form>
    </AuthShell>
  )
}
