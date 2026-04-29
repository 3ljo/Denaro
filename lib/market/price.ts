/**
 * Live spot price fetcher.
 *
 * Tries TwelveData first (true real-time spot for FX / metals / crypto).
 * Falls back to Yahoo's unofficial chart endpoint for symbols TwelveData
 * doesn't cover on the free tier (indices, oil/silver futures).
 *
 * Used by:
 *   - /api/ticker (browser polling, batched call for the whole watchlist)
 *   - /api/denaro/card (so the model anchors levels to the live price)
 */

import { withCache } from './cache'
import { tdQuotes, tdSymbol, type TDQuote } from './twelvedata'

const PAIR_TO_YAHOO: Record<string, string> = {
  XAUUSD: 'GC=F',
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
  USDJPY: 'USDJPY=X',
  AUDUSD: 'AUDUSD=X',
  USDCAD: 'USDCAD=X',
  NZDUSD: 'NZDUSD=X',
  EURJPY: 'EURJPY=X',
  GBPJPY: 'GBPJPY=X',
  BTCUSD: 'BTC-USD',
  ETHUSD: 'ETH-USD',
  NAS100: '^NDX',
  SPX500: '^GSPC',
  US30: '^DJI',
  GER40: '^GDAXI',
  UK100: '^FTSE',
  OIL: 'CL=F',
  SILVER: 'SI=F',
}

export type SpotPrice = {
  symbol: string
  price: number | null
  prev: number | null
  change: number | null
  changePercent: number | null
  asOf: string
  error?: string
}

/* --------------- Public --------------- */

/** Single-symbol fetch — used by /api/denaro/card. */
export async function fetchSpotPrice(symbol: string): Promise<SpotPrice> {
  const upper = symbol.toUpperCase()
  const apiKey = process.env.TWELVEDATA_API_KEY

  if (apiKey && tdSymbol(upper)) {
    try {
      const map = await withCache(`td-quote:${upper}`, 8_000, () =>
        tdQuotes([upper], apiKey),
      )
      const q = map.get(upper)
      if (q && q.price != null) return spotFromTD(upper, q)
    } catch (err) {
      console.error('twelvedata fetchSpotPrice', err)
    }
  }

  return withCache(`yahoo-quote:${upper}`, 10_000, () => fetchYahooSpot(upper))
}

/**
 * Batched fetch — used by /api/ticker. Hits TD /quote ONCE for all eligible
 * pairs, falls through to Yahoo for the rest. Preserves input order.
 */
export async function fetchSpotPrices(symbols: string[]): Promise<SpotPrice[]> {
  const upper = symbols.map((s) => s.toUpperCase())
  const apiKey = process.env.TWELVEDATA_API_KEY

  const tdEligible = upper.filter((s) => tdSymbol(s))
  const tdResults = new Map<string, SpotPrice>()
  const failedFromTD = new Set<string>()

  if (apiKey && tdEligible.length > 0) {
    try {
      const cacheKey = `td-quote-batch:${tdEligible.slice().sort().join(',')}`
      const map = await withCache(cacheKey, 8_000, () =>
        tdQuotes(tdEligible, apiKey),
      )
      for (const sym of tdEligible) {
        const q = map.get(sym)
        if (q && q.price != null) {
          tdResults.set(sym, spotFromTD(sym, q))
        } else {
          failedFromTD.add(sym)
        }
      }
    } catch (err) {
      console.error('twelvedata fetchSpotPrices', err)
      tdEligible.forEach((s) => failedFromTD.add(s))
    }
  } else {
    tdEligible.forEach((s) => failedFromTD.add(s))
  }

  // Anything TD didn't cover → Yahoo fallback (with cache).
  const yahooNeeded = upper.filter(
    (s) => !tdResults.has(s),
  )
  const yahooEntries = await Promise.all(
    yahooNeeded.map((sym) =>
      withCache(`yahoo-quote:${sym}`, 10_000, () => fetchYahooSpot(sym)),
    ),
  )
  const yahooMap = new Map(yahooEntries.map((r) => [r.symbol, r]))

  // Restore caller order.
  return upper.map((sym) => tdResults.get(sym) ?? yahooMap.get(sym) ?? emptyPrice(sym, 'no source'))
}

/* --------------- Helpers --------------- */

function spotFromTD(canonical: string, q: TDQuote): SpotPrice {
  return {
    symbol: canonical,
    price: q.price,
    prev: q.prev,
    change: q.change,
    changePercent: q.changePercent,
    asOf: new Date().toISOString(),
  }
}

function emptyPrice(symbol: string, error: string): SpotPrice {
  return {
    symbol,
    price: null,
    prev: null,
    change: null,
    changePercent: null,
    asOf: new Date().toISOString(),
    error,
  }
}

/* --------------- Yahoo fallback --------------- */

async function fetchYahooSpot(upper: string): Promise<SpotPrice> {
  const yahoo = PAIR_TO_YAHOO[upper] ?? upper
  const asOf = new Date().toISOString()
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=5d`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 Denaro' },
        cache: 'no-store',
      },
    )
    if (!res.ok) {
      return {
        symbol: upper,
        price: null,
        prev: null,
        change: null,
        changePercent: null,
        asOf,
        error: `yahoo ${res.status}`,
      }
    }
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) {
      return {
        symbol: upper,
        price: null,
        prev: null,
        change: null,
        changePercent: null,
        asOf,
        error: 'no meta',
      }
    }
    const price: number | null = meta.regularMarketPrice ?? null
    const prev: number | null =
      meta.chartPreviousClose ?? meta.previousClose ?? null
    const change = price !== null && prev !== null ? price - prev : null
    const changePercent =
      change !== null && prev !== null && prev !== 0
        ? (change / prev) * 100
        : null
    return { symbol: upper, price, prev, change, changePercent, asOf }
  } catch (err) {
    return {
      symbol: upper,
      price: null,
      prev: null,
      change: null,
      changePercent: null,
      asOf,
      error: err instanceof Error ? err.message : 'fetch failed',
    }
  }
}
