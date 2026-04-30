'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * TradingView Advanced Chart Widget — official script-tag embed.
 *
 * Why script tag and not a direct iframe URL: TradingView's iframe URLs
 * (`s.tradingview.com/widgetembed/`, `tradingview-widget.com/embed-widget/`)
 * refuse to render when loaded directly — they send X-Frame-Options or check
 * the referrer chain that the official script sets up. The browser shows
 * "This content is blocked." Loading via the official script gets the iframe
 * provisioned the way TradingView expects.
 *
 * React lifecycle: we mount the script into a unique container, give the
 * outer wrapper a `key` derived from `symbol`, and on unmount clear the
 * container. StrictMode double-mounts in dev are tolerated because both
 * mounts target the same container id — the second script invocation
 * overwrites the first.
 */

const TV_SYMBOL: Record<string, string> = {
  XAUUSD: 'OANDA:XAUUSD',
  EURUSD: 'OANDA:EURUSD',
  GBPUSD: 'OANDA:GBPUSD',
  USDJPY: 'OANDA:USDJPY',
  AUDUSD: 'OANDA:AUDUSD',
  USDCAD: 'OANDA:USDCAD',
  NZDUSD: 'OANDA:NZDUSD',
  EURJPY: 'OANDA:EURJPY',
  GBPJPY: 'OANDA:GBPJPY',
  BTCUSD: 'BINANCE:BTCUSDT',
  ETHUSD: 'BINANCE:ETHUSDT',
  NAS100: 'NASDAQ:NDX',
  SPX500: 'SP:SPX',
  US30: 'DJ:DJI',
  GER40: 'XETR:DAX',
  UK100: 'TVC:UKX',
  OIL: 'NYMEX:CL1!',
  SILVER: 'OANDA:XAGUSD',
}

export default function TradingViewChart({
  symbol,
  fill = false,
}: {
  symbol: string
  /** When true, the chart fills its parent (used inside the fullscreen modal). */
  fill?: boolean
}) {
  const tvSymbol = TV_SYMBOL[symbol.toUpperCase()] ?? symbol
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const host = containerRef.current
    if (!host) return

    // Symbol changed — reset loaded state and clear prior render.
    setLoaded(false)
    host.innerHTML = ''

    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget h-full w-full'
    host.appendChild(inner)

    // Watch for the iframe TradingView's script injects; flip `loaded` once
    // it appears so the skeleton can fade out.
    const observer = new MutationObserver(() => {
      if (host.querySelector('iframe')) {
        setLoaded(true)
        observer.disconnect()
      }
    })
    observer.observe(host, { childList: true, subtree: true })

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: 'rgba(10,19,34,0.6)',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      withdateranges: true,
      details: false,
      hideideas: true,
      studies: [],
    })
    host.appendChild(script)

    return () => {
      observer.disconnect()
      // Defuse any iframe gracefully before tearing it out — pointing it at
      // about:blank releases TradingView's pending postMessage listeners so
      // they don't error on a missing contentWindow when the host is wiped.
      const iframe = host.querySelector('iframe')
      if (iframe) {
        try {
          iframe.src = 'about:blank'
        } catch {
          // ignore; we're tearing it down anyway
        }
      }
      host.innerHTML = ''
    }
  }, [tvSymbol])

  return (
    <div
      className={`relative overflow-hidden rounded border border-cyan-400/20 bg-slate-950/50 ${fill ? 'h-full w-full' : 'h-[460px]'}`}
    >
      {/* Skeleton placeholder — shown while TradingView's script loads its
          iframe. Fades out once the iframe is detected inside the host. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-950 animate-pulse" />
        {/* Faint grid lines so it reads as a chart placeholder, not a blank box */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(125,211,252,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[0.6rem] tracking-[0.32em] text-cyan-200/60">
          // LOADING CHART
        </div>
      </div>

      <div
        ref={containerRef}
        className="tradingview-widget-container absolute inset-0 h-full w-full"
      />
    </div>
  )
}
