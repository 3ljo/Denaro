'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { register } from '@/lib/auth/actions'
import AuthShell from '@/app/_components/auth-shell'
import PasswordInput from '@/app/_components/password-input'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const tErr = useTranslations('auth.errors')
  const tMsg = useTranslations('auth.messages')
  const tValid = useTranslations('auth.register.validation')

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
      setError(tValid('emailRequired'))
      return
    }
    if (!password) {
      setError(tValid('passwordRequired'))
      return
    }
    if (password.length < 6) {
      setError(tValid('passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setError(tValid('passwordsDoNotMatch'))
      return
    }

    startTransition(async () => {
      const result = await register(formData)
      if (result?.errorKey) setError(tErr(result.errorKey))
      else if (result?.messageKey) setSuccessMsg(tMsg(result.messageKey))
    })
  }

  if (successMsg) {
    return (
      <AuthShell
        image="/pic/denaro-login.png"
        imageAlt={t('imageAltSent')}
        badge={t('badgeSent')}
        title={t('titleSent')}
        subtitle={t('subtitleSent')}
        routeCode={t('routeCodeSent')}
        formY="50%"
        footer={
          <p className="text-center text-xs tracking-wide">
            <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
              {t('backPortal')}
            </Link>
          </p>
        }
      >
        <div className="denaro-banner denaro-banner-success">{successMsg}</div>
        <p className="mt-4 text-xs tracking-wide text-cyan-100/60">
          {t('spamHint')}
        </p>
      </AuthShell>
    )
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
          {t('alreadyOnboard')}{' '}
          <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
            {t('signIn')}
          </Link>
        </p>
      }
    >
      <form action={handleRegister} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="denaro-label">
            {t('emailLabel')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t('emailPlaceholder')}
            className="denaro-input"
            onChange={() => {
              if (error) setError(null)
            }}
          />
        </div>

        <div>
          <label htmlFor="password" className="denaro-label">
            {t('passwordLabel')}
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            minLength={6}
            placeholder={t('passwordPlaceholder')}
            onChange={() => {
              if (error) setError(null)
            }}
          />
          <p className="mt-1.5 text-[0.65rem] tracking-wide text-cyan-100/45">
            {t('passwordHint')}
          </p>
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
