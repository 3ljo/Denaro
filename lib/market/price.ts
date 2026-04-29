/**
 * Live spot price fetcher — Yahoo Finance unofficial chart endpoint.
 * No API key. Used by /api/ticker (browser polling) and /api/denaro/card
 * (so the model gets the actual current price instead of hallucinating
 * from training-data-era ranges).
 */

const PAIR_TO_YAHOO: Record<string, string> = {
  XAUUSD: 'XAUUSD=X',
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

export async function fetchSpotPrice(symbol: string): Promise<SpotPrice> {
  const upper = symbol.toUpperCase()
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
