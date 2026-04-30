'use client'

import { useTranslations } from 'next-intl'

/**
 * Live ticker — TradingView TickerTape widget embedded as a direct iframe.
 *
 * Why this over our own /api/ticker polling:
 *   - Polling at 12s vs. TradingView's licensed stream isn't really live.
 *   - The widget shows asset logos out of the box (currency flags, crypto
 *     coin icons, index badges) — operator asked for those.
 *   - Tick-by-tick price + change %, theme-matched dark transparent panel.
 *
 * Symbols are mapped to TradingView's exchange-prefixed format (OANDA, BINANCE,
 * etc.) — same map the chart card uses. Pairs we don't recognise get dropped
 * before the iframe renders.
 */

const TV_TICKER: Record<string, { description: string; proName: string }> = {
  XAUUSD: { description: 'Gold',     proName: 'OANDA:XAUUSD'   },
  EURUSD: { description: 'EUR/USD',  proName: 'OANDA:EURUSD'   },
  GBPUSD: { description: 'GBP/USD',  proName: 'OANDA:GBPUSD'   },
  USDJPY: { description: 'USD/JPY',  proName: 'OANDA:USDJPY'   },
  AUDUSD: { description: 'AUD/USD',  proName: 'OANDA:AUDUSD'   },
  USDCAD: { description: 'USD/CAD',  proName: 'OANDA:USDCAD'   },
  NZDUSD: { description: 'NZD/USD',  proName: 'OANDA:NZDUSD'   },
  EURJPY: { description: 'EUR/JPY',  proName: 'OANDA:EURJPY'   },
  GBPJPY: { description: 'GBP/JPY',  proName: 'OANDA:GBPJPY'   },
  BTCUSD: { description: 'Bitcoin',  proName: 'BINANCE:BTCUSDT' },
  ETHUSD: { description: 'Ethereum', proName: 'BINANCE:ETHUSDT' },
  NAS100: { description: 'Nasdaq 100', proName: 'NASDAQ:NDX'   },
  SPX500: { description: 'S&P 500',  proName: 'SP:SPX'         },
  US30:   { description: 'Dow',      proName: 'DJ:DJI'         },
  GER40:  { description: 'DAX',      proName: 'XETR:DAX'       },
  UK100:  { description: 'FTSE 100', proName: 'TVC:UKX'        },
  OIL:    { description: 'Crude Oil', proName: 'NYMEX:CL1!'    },
  SILVER: { description: 'Silver',   proName: 'OANDA:XAGUSD'   },
}

export default function TickerBar({ pairs }: { pairs: string[] }) {
  const t = useTranslations('dashboard.ticker')
  const symbols = pairs
    .map((p) => TV_TICKER[p.toUpperCase()])
    .filter((s): s is { description: string; proName: string } => Boolean(s))

  if (symbols.length === 0) return null

  const config = {
    symbols,
    showSymbolLogo: true,
    isTransparent: false,
    displayMode: 'adaptive',
    colorTheme: 'dark',
    locale: 'en',
  }

  // The script-based embed widget targets this exact URL internally.
  // Building it ourselves removes the script-load timing issue and lets
  // us SSR-friendly-render in one shot.
  const url =
    `https://www.tradingview-widget.com/embed-widget/ticker-tape/` +
    `?locale=en#${encodeURIComponent(JSON.stringify(config))}`

  return (
    <div className="overflow-hidden rounded-md border border-cyan-400/30 bg-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
      <iframe
        src={url}
        title={t('title')}
        className="block h-[46px] w-full border-0"
        scrolling="no"
        allow="clipboard-write"
      />
    </div>
  )
}
