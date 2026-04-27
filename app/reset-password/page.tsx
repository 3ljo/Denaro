import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ResetPasswordForm from './form'

export default async function ResetPasswordPage() {
  // SECURITY: This page is only accessible if the user came through a valid
  // /auth/confirm flow with type='recovery'. That flow gives them a session.
  // If there's no session, they tried to access this directly — reject.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Link invalid or expired</h1>
          <p className="text-sm text-neutral-600">
            Your reset link is no longer valid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm font-medium text-neutral-900 hover:underline"
          >
            Request new link
          </Link>
        </div>
      </main>
    )
  }

  return <ResetPasswordForm />
}
