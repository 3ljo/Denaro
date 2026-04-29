import Link from 'next/link'
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
    return (
      <AuthShell
        image="/pic/denaro-login.png"
        imageAlt="Denaro signaling an invalid link"
        badge="// LINK ▸ INVALID"
        title="Recovery Failed"
        subtitle="Your reset link is no longer valid or has expired."
        routeCode=">> /AUTH/RECOVER/EXPIRED"
        formY="50%"
        footer={
          <p className="text-center text-xs tracking-wide">
            <Link href="/login" className="font-semibold text-amber-300 hover:text-amber-200">
              ← Back to access portal
            </Link>
          </p>
        }
      >
        <Link href="/forgot-password" className="denaro-btn block text-center">
          Request New Link
        </Link>
      </AuthShell>
    )
  }

  return <ResetPasswordForm />
}
