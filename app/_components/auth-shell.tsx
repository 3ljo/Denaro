import Image from 'next/image'

type Props = {
  /** Path to the Denaro character image (in /public). Should be a transparent PNG. */
  image: string
  imageAlt?: string
  /** Tech badge above the title, e.g. "// SIGN IN" */
  badge?: string
  title: string
  subtitle?: string
  /** Path code shown in the bottom status bar */
  routeCode?: string
  /**
   * CSS top value for the form panel center. Tunes the panel to sit on the
   * hologram region of each character image. Default '46%' targets the chest.
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
    <main className="relative min-h-dvh w-full overflow-hidden bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-60" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-1/4 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute -bottom-1/4 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 denaro-noise opacity-[0.05] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Glow disc beneath character feet */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 left-1/2 z-[5] h-28 w-[300px] -translate-x-1/2 rounded-full bg-cyan-400/30 blur-3xl animate-glowPulse sm:bottom-6 sm:h-36 sm:w-[420px]"
      />

      {/* Character — fills viewport, anchored to bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center"
      >
        <div className="relative h-full w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[640px]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 640px, (min-width: 640px) 520px, 100vw"
            className="object-contain object-bottom drop-shadow-[0_0_60px_rgba(34,211,238,0.3)]"
          />
        </div>
      </div>

      {/* Hologram form panel — compact overlay on character chest/hologram area */}
      <div
        className="absolute z-30 w-[min(86vw,300px)]"
        style={{ left: '50%', top: formY, transform: 'translate(-50%, -50%)' }}
      >
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

          <div className="px-4 py-4">
            {badge && (
              <p className="mb-1 font-display text-[0.55rem] tracking-[0.35em] text-amber-300/90">
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
