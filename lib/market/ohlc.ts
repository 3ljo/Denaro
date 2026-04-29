/**
 * OHLC candle fetcher — Yahoo Finance unofficial chart endpoint.
 *
 * Yahoo intraday intervals (1m..60m) are rate-limited and have shorter range
 * caps. We aggregate 1h bars into 4h client-side because Yahoo doesn't expose
 * a native 4h bucket.
 */

const PAIR_TO_YAHOO: Record<string, string> = {
  // Yahoo dropped spot XAUUSD=X — use gold futures (continuous contract).
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

export type Interval = '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1wk'
export const INTERVALS: Interval[] = ['5m', '15m', '30m', '1h', '4h', '1d', '1wk']

export type OHLCBar = {
  /** Unix epoch in seconds (UTC). */
  time: number
  open: number
  high: number
  low: number
  close: number
}

/** Map our intervals to (yahoo interval, yahoo range) windows. */
const INTERVAL_PARAMS: Record<Interval, { yi: string; range: string; aggregate?: number }> = {
  '5m':  { yi: '5m',  range: '5d' },
  '15m': { yi: '15m', range: '5d' },
  '30m': { yi: '30m', range: '1mo' },
  '1h':  { yi: '60m', range: '1mo' },
  '4h':  { yi: '60m', range: '3mo', aggregate: 4 },
  '1d':  { yi: '1d',  range: '1y' },
  '1wk': { yi: '1wk', range: '5y' },
}

export async function fetchOHLC(
  symbol: string,
  interval: Interval,
): Promise<OHLCBar[]> {
  const upper = symbol.toUpperCase()
  const yahoo = PAIR_TO_YAHOO[upper] ?? upper
  const cfg = INTERVAL_PARAMS[interval] ?? INTERVAL_PARAMS['15m']

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=${cfg.yi}&range=${cfg.range}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 Denaro' },
    cache: 'no-store',
  })
  if (!res.ok) return []

  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) return []

  const ts: number[] = result.timestamp ?? []
  const q = result.indicators?.quote?.[0] ?? {}
  const opens = (q.open ?? []) as (number | null)[]
  const highs = (q.high ?? []) as (number | null)[]
  const lows = (q.low ?? []) as (number | null)[]
  const closes = (q.close ?? []) as (number | null)[]

  const bars: OHLCBar[] = []
  for (let i = 0; i < ts.length; i++) {
    const o = opens[i], h = highs[i], l = lows[i], c = closes[i]
    if (o == null || h == null || l == null || c == null) continue
    bars.push({ time: ts[i], open: o, high: h, low: l, close: c })
  }

  if (cfg.aggregate && cfg.aggregate > 1) {
    return aggregate(bars, cfg.aggregate)
  }
  return bars
}

function aggregate(bars: OHLCBar[], factor: number): OHLCBar[] {
  const out: OHLCBar[] = []
  for (let i = 0; i < bars.length; i += factor) {
    const slice = bars.slice(i, i + factor)
    if (slice.length === 0) continue
    out.push({
      time: slice[0].time,
      open: slice[0].open,
      high: Math.max(...slice.map((b) => b.high)),
      low: Math.min(...slice.map((b) => b.low)),
      close: slice[slice.length - 1].close,
    })
  }
  return out
}
