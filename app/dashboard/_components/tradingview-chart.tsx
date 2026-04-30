'use client'

import { useEffect, useRef } from 'react'

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

export default function TradingViewChart({ symbol }: { symbol: string }) {
  const tvSymbol = TV_SYMBOL[symbol.toUpperCase()] ?? symbol
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = containerRef.current
    if (!host) return

    // Clear any prior render (StrictMode double-mount or symbol change).
    host.innerHTML = ''

    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget h-full w-full'
    host.appendChild(inner)

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
      host.innerHTML = ''
    }
  }, [tvSymbol])

  return (
    <div className="relative h-[460px] overflow-hidden rounded border border-cyan-400/20 bg-slate-950/50">
      <div
        ref={containerRef}
        className="tradingview-widget-container absolute inset-0 h-full w-full"
      />
    </div>
  )
}
