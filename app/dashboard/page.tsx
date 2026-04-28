import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'

export default async function DashboardPage() {
  // SECURITY: This is the SECOND check (middleware does the first).
  // Defense in depth — never rely on middleware alone for authorization.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 safe-top safe-bottom sm:py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 active:bg-neutral-100"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <p className="text-sm text-neutral-600">Signed in as</p>
          <p className="break-all font-medium">{user.email}</p>
          <p className="mt-2 text-xs text-neutral-500">
            Email verified at:{' '}
            {user.email_confirmed_at
              ? new Date(user.email_confirmed_at).toLocaleString()
              : 'not yet'}
          </p>
        </div>
      </div>
    </main>
  )
}
