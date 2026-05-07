'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { SubscriptionTier } from '@/lib/profile/types'

const TIER_TONE: Record<SubscriptionTier, string> = {
  free:
    'border-cyan-400/35 bg-cyan-500/[0.08] text-cyan-200/85 hover:border-amber-300/60 hover:bg-amber-400/10 hover:text-amber-200',
  pro: 'border-cyan-300/55 bg-cyan-500/15 text-cyan-50 hover:border-cyan-200/70 hover:bg-cyan-500/22',
  elite:
    'border-amber-300/70 bg-amber-400/15 text-amber-100 shadow-[0_0_10px_rgba(251,191,36,0.22)] hover:border-amber-200/90 hover:bg-amber-400/22',
}

const DOT_TONE: Record<SubscriptionTier, string> = {
  free: 'bg-cyan-300/55',
  pro: 'bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.7)]',
  elite: 'bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.85)]',
}

/**
 * Tier badge for the dashboard header. Free users get a subtle CTA hover
 * tint and a tooltip that nudges toward /pricing; paid users see a
 * tier-toned pill that links to /settings → Subscription.
 */
export default function PlanBadge({ tier }: { tier: SubscriptionTier }) {
  const tTiers = useTranslations('settings.sections.strategy.tiers')
  const tBadge = useTranslations('dashboard.header.plan')
  const href = tier === 'free' ? '/pricing' : '/settings'
  const title = tier === 'free' ? tBadge('upgradeHint') : tBadge('manageHint')

  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-1.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.22em] transition ${TIER_TONE[tier]}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONE[tier]}`} />
      <span>{tTiers(tier)}</span>
    </Link>
  )
}
