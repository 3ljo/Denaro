import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Redirects the operator to their Lemon Squeezy customer portal.
 *
 * The portal URL comes from the LS webhook (subscription_created /
 * updated payload) and is stored on profiles.customer_portal_url. If
 * it's not populated yet — either the webhook hasn't fired or LS isn't
 * wired — falls back to /pricing?status=coming-soon.
 */
export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { data } = await supabase
    .from('profiles')
    .select('customer_portal_url')
    .eq('id', user.id)
    .maybeSingle()

  const portalUrl = data?.customer_portal_url
  if (!portalUrl) {
    const fallback = new URL('/pricing', req.url)
    fallback.searchParams.set('status', 'coming-soon')
    return NextResponse.redirect(fallback)
  }

  return NextResponse.redirect(portalUrl)
}
