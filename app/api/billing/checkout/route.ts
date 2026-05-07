import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createCheckoutUrl,
  isLemonSqueezyPlan,
} from '@/lib/billing/lemonsqueezy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Starts a Lemon Squeezy checkout for the requested plan.
 *
 * Query: ?plan=pro_monthly | pro_yearly | elite_monthly | elite_yearly
 *
 * Behavior:
 *   - 302 → Lemon Squeezy checkout URL when LS is configured.
 *   - 302 → /pricing?status=coming-soon when LS env vars are missing
 *     (the UI surfaces this state with a friendly banner).
 *   - 401 → /login if there's no session.
 *   - 400 if the plan is missing or invalid.
 */
export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }

  const url = new URL(req.url)
  const plan = url.searchParams.get('plan')
  if (!isLemonSqueezyPlan(plan)) {
    return new NextResponse('invalid plan', { status: 400 })
  }

  const checkoutUrl = await createCheckoutUrl({
    plan,
    userId: user.id,
    email: user.email ?? '',
  })

  if (!checkoutUrl) {
    // LS not configured yet — bounce to pricing with a status param so the
    // page renders the "coming soon" banner.
    const fallback = new URL('/pricing', req.url)
    fallback.searchParams.set('status', 'coming-soon')
    return NextResponse.redirect(fallback)
  }

  return NextResponse.redirect(checkoutUrl)
}
