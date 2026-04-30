'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { forgotPassword } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgot')
  const tMsg = useTranslations('auth.messages')

  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result?.messageKey) setMessage(tMsg(result.messageKey))
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
      footer={
        <p className="text-center text-xs tracking-wide">
          <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
            {t('backPortal')}
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
              {t('emailLabel')}
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
              placeholder={t('emailPlaceholder')}
              className="denaro-input"
            />
          </div>

          <button type="submit" disabled={isPending} className="denaro-btn">
            {isPending ? t('submitting') : t('submit')}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
