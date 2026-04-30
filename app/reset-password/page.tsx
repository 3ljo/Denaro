import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/app/_components/auth-shell'
import ResetPasswordForm from './form'

export default async function ResetPasswordPage() {
  // SECURITY: This page is only accessible if the user came through a valid
  // /auth/confirm flow with type='recovery'. That flow gives them a session.
  // If there's no session, they tried to access this directly — reject.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const t = await getTranslations('auth.reset')
    return (
      <AuthShell
        image="/pic/denaro-login.png"
        imageAlt={t('imageAltInvalid')}
        badge={t('badgeInvalid')}
        title={t('titleInvalid')}
        subtitle={t('subtitleInvalid')}
        routeCode={t('routeCodeInvalid')}
        formY="50%"
        footer={
          <p className="text-center text-xs tracking-wide">
            <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
              {t('backPortal')}
            </Link>
          </p>
        }
      >
        <Link href="/forgot-password" className="denaro-btn block text-center">
          {t('requestNew')}
        </Link>
      </AuthShell>
    )
  }

  return <ResetPasswordForm />
}
