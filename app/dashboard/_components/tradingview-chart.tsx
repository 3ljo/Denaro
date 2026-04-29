'use client'

import { useEffect, useRef } from 'react'

/**
 * TradingView Advanced Chart Widget. Loaded from s3.tradingview.com via the
 * official embed pattern (script tag whose innerText is the JSON config).
 *
 * Why this over our own lightweight-charts implementation: the widget runs
 * on TradingView's licensed real-time data feed, so candles form tick-by-
 * tick. Tradeoff: it lives in an iframe, so we can't capture it for the
 * Snap-to-AI flow. The Vision tab's mini-charts (custom lightweight-charts)
 * are kept exactly for that purpose.
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
  const containerRef = useRef<HTMLDivElement>(null)
  const tvSymbol = TV_SYMBOL[symbol.toUpperCase()] ?? symbol

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear prior render (StrictMode double-mount + symbol change).
    container.innerHTML = ''

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.height = '100%'
    widgetDiv.style.width = '100%'

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.text = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: 'rgba(10, 19, 34, 0.6)',
      backgroundColor: 'rgba(10, 19, 34, 0.6)',
      gridColor: 'rgba(125, 211, 252, 0.06)',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      withdateranges: true,
      allow_symbol_change: false,
      details: false,
      hotlist: false,
      calendar: false,
      save_image: false,
      studies: [],
      show_popup_button: false,
      support_host: 'https://www.tradingview.com',
    })

    container.appendChild(widgetDiv)
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [tvSymbol])

  return (
    <div className="relative h-[460px] overflow-hidden rounded border border-cyan-400/20 bg-slate-950/50">
      <div
        ref={containerRef}
        className="tradingview-widget-container absolute inset-0"
      />
    </div>
  )
}
