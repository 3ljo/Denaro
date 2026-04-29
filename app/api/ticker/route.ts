/**
 * Free-tier ticker — proxies Yahoo Finance unofficial chart endpoint.
 * No API key needed. Returns last close + day change for a list of pairs.
 *
 * Note: Yahoo's data is delayed (15-20m for indices, ~real-time for FX/crypto)
 * and rate-limited. This is fine for a "what's it doing today" indicator;
 * upgrade to TwelveData / Polygon when we need tick data.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

type TickerResult = {
  symbol: string
  price: number | null
  prev: number | null
  change: number | null
  changePercent: number | null
  error?: string
}

async function fetchSymbol(symbol: string): Promise<TickerResult> {
  const yahoo = PAIR_TO_YAHOO[symbol.toUpperCase()] ?? symbol
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
        symbol,
        price: null,
        prev: null,
        change: null,
        changePercent: null,
        error: `yahoo ${res.status}`,
      }
    }
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) {
      return {
        symbol,
        price: null,
        prev: null,
        change: null,
        changePercent: null,
        error: 'no meta',
      }
    }
    const price: number | null = meta.regularMarketPrice ?? null
    const prev: number | null = meta.chartPreviousClose ?? meta.previousClose ?? null
    const change = price !== null && prev !== null ? price - prev : null
    const changePercent =
      change !== null && prev !== null && prev !== 0 ? (change / prev) * 100 : null
    return { symbol, price, prev, change, changePercent }
  } catch (err) {
    return {
      symbol,
      price: null,
      prev: null,
      change: null,
      changePercent: null,
      error: err instanceof Error ? err.message : 'fetch failed',
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbols = (url.searchParams.get('symbols') ?? '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 8)

  if (symbols.length === 0) {
    return Response.json([])
  }

  const results = await Promise.all(symbols.map(fetchSymbol))
  return Response.json(results, { headers: { 'Cache-Control': 'no-store' } })
}
