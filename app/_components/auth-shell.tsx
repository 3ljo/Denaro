import Image from 'next/image'

type Props = {
  /** Path to the Denaro character image (in /public) */
  image: string
  /** Optional alt for the character image */
  imageAlt?: string
  /** Tech-style badge above the title, e.g. "// SIGN IN" */
  badge?: string
  /** Main heading */
  title: string
  /** Optional subtitle below the heading */
  subtitle?: string
  /** Path code shown in the bottom status bar, e.g. "/auth/login" */
  routeCode?: string
  /** Form / panel body */
  children: React.ReactNode
  /** Optional links/footer below the form */
  footer?: React.ReactNode
}

export default function AuthShell({
  image,
  imageAlt = 'Denaro',
  badge,
  title,
  subtitle,
  routeCode,
  children,
  footer,
}: Props) {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 denaro-stars opacity-60" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[32rem] w-[32rem] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 denaro-noise opacity-[0.06] mix-blend-overlay" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-6 lg:flex-row lg:gap-10 lg:py-10">
        {/* Character */}
        <div className="relative flex w-full max-w-md items-end justify-center lg:max-w-xl lg:flex-1">
          {/* Glow disc behind character */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-4 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl animate-glowPulse"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl"
          />

          <div className="relative h-[34vh] w-full sm:h-[42vh] lg:h-[82vh]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain object-bottom drop-shadow-[0_0_45px_rgba(34,211,238,0.25)] animate-float"
            />
          </div>

          {/* Beam connecting character to hologram panel (desktop only) */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-24 -translate-y-1/2 translate-x-full bg-gradient-to-r from-cyan-300/70 to-transparent lg:block"
          >
            <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
          </div>
        </div>

        {/* Hologram form panel */}
        <div className="relative w-full max-w-md lg:flex-1 lg:max-w-md xl:max-w-lg">
          <HologramFrame>
            {/* Top status bar */}
            <div className="flex items-center justify-between border-b border-cyan-400/20 px-4 py-2.5 text-[0.62rem]">
              <span className="denaro-pill">
                <span className="denaro-dot" />
                Denaro.OS
              </span>
              <span className="font-display tracking-[0.3em] text-cyan-200/70">
                SECURE&nbsp;CHANNEL
              </span>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7">
              {badge && (
                <p className="mb-3 font-display text-[0.65rem] tracking-[0.4em] text-amber-300/90">
                  {badge}
                </p>
              )}
              <h1 className="font-display text-2xl font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-[1.65rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-cyan-100/60">{subtitle}</p>
              )}

              <div className="mt-6">{children}</div>

              {footer && (
                <div className="mt-6 border-t border-cyan-400/15 pt-4 text-sm text-cyan-100/70">
                  {footer}
                </div>
              )}
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between border-t border-cyan-400/20 px-4 py-2 text-[0.6rem] text-cyan-200/55">
              <span className="font-display tracking-[0.25em]">
                {routeCode ?? '>> AUTH'}
              </span>
              <span className="font-display tracking-[0.25em] text-amber-300/70">
                ENC&nbsp;AES-256
              </span>
            </div>
          </HologramFrame>
        </div>
      </div>
    </main>
  )
}

/** The translucent cyan hologram frame with corner brackets + scan line. */
function HologramFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="denaro-panel relative overflow-hidden rounded-md">
      {/* Corner brackets — gold, like Denaro's accents */}
      <Corner className="left-0 top-0" />
      <Corner className="right-0 top-0 rotate-90" />
      <Corner className="right-0 bottom-0 rotate-180" />
      <Corner className="left-0 bottom-0 -rotate-90" />

      {/* Animated scan line sweeping vertically */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px denaro-scanline animate-scan"
      />

      {/* Top hairline highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
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
        borderTop: '1.5px solid rgba(251, 191, 36, 0.85)',
        borderLeft: '1.5px solid rgba(251, 191, 36, 0.85)',
        filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))',
      }}
    />
  )
}
