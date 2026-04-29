import Image from 'next/image'

type Props = {
  /** Path to the Denaro character PNG (transparent). */
  image: string
  imageAlt?: string
  /** Tech badge above the title, e.g. "// SIGN IN" */
  badge?: string
  title: string
  subtitle?: string
  /** Path code shown in the bottom status bar */
  routeCode?: string
  /**
   * Form vertical position on desktop (lg+) only. Mobile is always stacked.
   * Default '50%' centers vertically on the character.
   */
  formY?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AuthShell({
  image,
  imageAlt = 'Denaro',
  badge,
  title,
  subtitle,
  routeCode,
  formY = '50%',
  children,
  footer,
}: Props) {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop — fixed so it stays put if mobile content scrolls */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-60" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-1/4 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute -bottom-1/4 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 denaro-noise opacity-[0.05] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/*
        Stage container — single render, two layouts via media queries:
          - Mobile (< lg): flex column, character on top, form below
          - Desktop (lg+): both children become absolute, character fills the
            viewport, form overlays the chest at top: var(--form-y)
      */}
      <div
        className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-3 px-4 py-6 lg:max-w-none lg:gap-0 lg:p-0"
        style={{ '--form-y': formY } as React.CSSProperties}
      >
        {/* Character */}
        <div
          aria-hidden
          className="relative w-full max-w-[240px] aspect-[2/3] flex-shrink-0 sm:max-w-[300px]
                     lg:absolute lg:inset-0 lg:flex lg:max-w-none lg:aspect-auto lg:items-end lg:justify-center lg:pointer-events-none"
        >
          {/* Glow disc beneath */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-[60%] -translate-x-1/2 rounded-full bg-cyan-400/40 blur-2xl animate-glowPulse lg:bottom-6 lg:h-36 lg:w-[420px]" />
          {/* Image */}
          <div className="relative h-full w-full lg:max-w-[820px]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 820px, (min-width: 640px) 300px, 240px"
              className="object-contain object-bottom drop-shadow-[0_0_45px_rgba(34,211,238,0.3)] lg:drop-shadow-[0_0_60px_rgba(34,211,238,0.3)]"
            />
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full max-w-[380px] lg:absolute lg:left-1/2 lg:top-[var(--form-y)] lg:z-30 lg:w-[300px] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2">
          <HologramFrame>
            {/* Top status bar */}
            <div className="flex items-center justify-between border-b border-cyan-400/25 px-3 py-1.5 text-[0.55rem]">
              <span className="denaro-pill text-[0.55rem]">
                <span className="denaro-dot" />
                Denaro.OS
              </span>
              <span className="font-display tracking-[0.28em] text-cyan-200/70">
                SECURE
              </span>
            </div>

            <div className="px-4 py-4 sm:px-5 sm:py-5">
              {badge && (
                <p className="mb-1.5 font-display text-[0.55rem] tracking-[0.35em] text-amber-300/90">
                  {badge}
                </p>
              )}
              <h1 className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/60">
                  {subtitle}
                </p>
              )}

              <div className="mt-4">{children}</div>

              {footer && (
                <div className="mt-3 border-t border-cyan-400/15 pt-3 text-xs text-cyan-100/70">
                  {footer}
                </div>
              )}
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between border-t border-cyan-400/25 px-3 py-1 text-[0.52rem] text-cyan-200/55">
              <span className="font-display tracking-[0.22em]">
                {routeCode ?? '>> AUTH'}
              </span>
              <span className="font-display tracking-[0.22em] text-amber-300/70">
                AES-256
              </span>
            </div>
          </HologramFrame>
        </div>
      </div>
    </main>
  )
}

/** Translucent cyan hologram frame with corner brackets and animated scan line. */
function HologramFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="denaro-panel relative overflow-hidden rounded-md">
      <Corner className="left-0 top-0" />
      <Corner className="right-0 top-0 rotate-90" />
      <Corner className="right-0 bottom-0 rotate-180" />
      <Corner className="left-0 bottom-0 -rotate-90" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px denaro-scanline animate-scan"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
      />

      <div className="relative">{children}</div>
    </div>
  )
}

function Corner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-4 w-4 ${className}`}
      style={{
        borderTop: '1.5px solid rgba(251, 191, 36, 0.9)',
        borderLeft: '1.5px solid rgba(251, 191, 36, 0.9)',
        filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.7))',
      }}
    />
  )
}
