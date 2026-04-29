import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import DenaroChat from './_components/denaro-chat'

export default async function DashboardPage() {
  // SECURITY: This is the SECOND check (middleware does the first).
  // Defense in depth — never rely on middleware alone for authorization.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-3xl flex-col gap-3 px-4 py-3 sm:py-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/80">
              // ANALYST ▸ ONLINE
            </p>
            <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-cyan-50 sm:text-xl">
              Denaro
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden break-all text-right text-[0.65rem] tracking-wide text-cyan-100/55 sm:inline">
              {user.email}
            </span>
            <form action={logout}>
              <button type="submit" className="denaro-btn-ghost">
                Disconnect
              </button>
            </form>
          </div>
        </header>

        <DenaroChat />
      </div>
    </main>
  )
}
