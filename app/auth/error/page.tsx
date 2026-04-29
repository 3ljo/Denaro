import Link from 'next/link'
import AuthShell from '@/app/_components/auth-shell'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams

  return (
    <AuthShell
      image="/pic/main%20character.png"
      imageAlt="Denaro on standby"
      badge="// SIGNAL ▸ LOST"
      title="Connection Refused"
      subtitle="The link is invalid, expired, or already used."
      routeCode=">> /AUTH/ERROR"
      footer={
        <div className="space-y-2 text-center">
          <Link
            href="/login"
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 hover:text-amber-200"
          >
            ← Back to access portal
          </Link>
          <Link
            href="/forgot-password"
            className="block text-[0.7rem] tracking-wide text-cyan-100/60 hover:text-cyan-100"
          >
            Request a new recovery link
          </Link>
        </div>
      }
    >
      {reason && (
        <div className="denaro-banner denaro-banner-error break-words">
          Details: {reason}
        </div>
      )}
      {!reason && (
        <p className="text-sm text-cyan-100/60">
          Try signing in again, or request a new link if this was a recovery email.
        </p>
      )}
    </AuthShell>
  )
}
