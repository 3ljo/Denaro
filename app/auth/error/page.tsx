import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import AuthShell from '@/app/_components/auth-shell'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const t = await getTranslations('auth.error')

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
        <div className="space-y-2 text-center">
          <Link
            href="/login"
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 hover:text-amber-200"
          >
            {t('backPortal')}
          </Link>
          <Link
            href="/forgot-password"
            className="block text-[0.7rem] tracking-wide text-cyan-100/60 hover:text-cyan-100"
          >
            {t('requestNew')}
          </Link>
        </div>
      }
    >
      {reason && (
        <div className="denaro-banner denaro-banner-error break-words">
          {t('details', { reason })}
        </div>
      )}
      {!reason && (
        <p className="text-sm text-cyan-100/60">
          {t('fallback')}
        </p>
      )}
    </AuthShell>
  )
}
