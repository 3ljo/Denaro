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
    <main className="relative min-h-dvh w-full overflow-hidden bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-[0.65rem] tracking-[0.4em] text-amber-300/80">
                // GRID ▸ ONLINE
              </p>
              <h1 className="font-display text-2xl font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-3xl">
                Dashboard
              </h1>
            </div>
            <form action={logout}>
              <button type="submit" className="denaro-btn-ghost">
                Disconnect
              </button>
            </form>
          </div>

          <div className="denaro-panel rounded-md p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="denaro-dot" />
              <p className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-200/70">
                Operator Identified
              </p>
            </div>
            <p className="mt-2 break-all font-display text-lg font-semibold text-cyan-50">
              {user.email}
            </p>
            <p className="mt-3 text-[0.7rem] tracking-wide text-cyan-100/55">
              Verification timestamp:{' '}
              <span className="text-amber-200/90">
                {user.email_confirmed_at
                  ? new Date(user.email_confirmed_at).toLocaleString()
                  : 'pending'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
