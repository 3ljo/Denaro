'use client'

/**
 * TradingView Advanced Chart embedded as a direct iframe.
 *
 * The previous script-tag embed pattern is finicky in React (StrictMode
 * double-mount, async script timing) — direct iframe is deterministic and
 * loads on first render.
 *
 * URL: https://s.tradingview.com/widgetembed/  (verified 200 OK).
 *
 * Live data comes from TradingView's licensed real-time feed, which is what
 * we wanted — tick-by-tick candle formation. Tradeoff: lives in an iframe
 * so we can't snapshot it for the Snap-to-AI flow. Vision-tab mini-charts
 * (lightweight-charts) are kept exactly for that purpose.
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

  const params = new URLSearchParams({
    symbol: tvSymbol,
    interval: '15',
    timezone: 'Etc/UTC',
    theme: 'dark',
    style: '1', // candlestick
    locale: 'en',
    toolbarbg: 'rgba(10,19,34,0.6)',
    hidesidetoolbar: '0',
    hidetoptoolbar: '0',
    saveimage: '0',
    studies: '[]',
    hideideas: '1',
    allow_symbol_change: '0',
    details: '0',
    withdateranges: '1',
  })

  const url = `https://s.tradingview.com/widgetembed/?${params.toString()}`

  return (
    <div className="relative h-[460px] overflow-hidden rounded border border-cyan-400/20 bg-slate-950/50">
      <iframe
        src={url}
        title={`${tvSymbol} chart`}
        className="absolute inset-0 h-full w-full"
        frameBorder={0}
        scrolling="no"
        allowTransparency
        allow="clipboard-write; fullscreen"
      />
    </div>
  )
}
