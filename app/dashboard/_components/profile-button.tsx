'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

/** Avatar button — initial inside a glowing ring, links to /settings.
 *  No image is stored on the profile yet, so the initial is the avatar. */
export default function ProfileButton({
  displayName,
  email,
}: {
  displayName: string | null
  email: string
}) {
  const t = useTranslations('dashboard.header')
  const initial = pickInitial(displayName, email)
  const tooltip = `${t('openSettings')} — ${displayName || email}`

  return (
    <Link
      href="/settings"
      aria-label={tooltip}
      title={tooltip}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/[0.06] font-display text-[0.85rem] font-bold uppercase tracking-wide text-cyan-100 transition hover:border-amber-300/70 hover:bg-amber-400/15 hover:text-amber-100 hover:shadow-[0_0_18px_rgba(251,191,36,0.35)]"
    >
      {/* Subtle outer halo */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/0 blur-md transition group-hover:bg-amber-400/30"
      />
      <span className="relative">{initial}</span>
      {/* Tiny status dot — operator is online */}
      <span
        aria-hidden
        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-denaro-bg bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]"
      />
    </Link>
  )
}

function pickInitial(displayName: string | null, email: string): string {
  const source = (displayName ?? '').trim() || email
  if (!source) return '?'
  // Match a unicode letter or digit — handles Albanian Ç, Ë, etc.
  const m = source.match(/\p{L}|\p{N}/u)
  return (m?.[0] ?? source[0] ?? '?').toUpperCase()
}
