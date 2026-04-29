/**
 * TwelveData client — primary live source for FX / metals / crypto.
 *
 * Free tier limits: 800 req/day · 8 req/min. The /quote endpoint accepts
 * comma-separated symbols (one batched call for the whole ticker bar) and
 * /time_series returns OHLC at the timeframes the dashboard offers.
 *
 * Indices (NAS100, SPX500, US30, GER40, UK100) and oil/silver futures
 * deliberately excluded — they're either gated to the paid plan or
 * symbol-mapped through different exchanges. Yahoo handles those.
 */

import type { Interval } from './ohlc'

const TD_BASE = 'https://api.twelvedata.com'

const PAIR_TO_TD_SYMBOL: Record<string, string> = {
  XAUUSD: 'XAU/USD',
  EURUSD: 'EUR/USD',
  GBPUSD: 'GBP/USD',
  USDJPY: 'USD/JPY',
  AUDUSD: 'AUD/USD',
  USDCAD: 'USD/CAD',
  NZDUSD: 'NZD/USD',
  EURJPY: 'EUR/JPY',
  GBPJPY: 'GBP/JPY',
  BTCUSD: 'BTC/USD',
  ETHUSD: 'ETH/USD',
  SILVER: 'XAG/USD',
}

const INTERVAL_MAP: Record<Interval, string> = {
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1h': '1h',
  '4h': '4h',
  '1d': '1day',
  '1wk': '1week',
  '1mo': '1month',
}

export function tdSymbol(pair: string): string | null {
  return PAIR_TO_TD_SYMBOL[pair.toUpperCase()] ?? null
}

export type TDQuote = {
  symbol: string // canonical (e.g. "XAUUSD")
  price: number | null
  prev: number | null
  change: number | null
  changePercent: number | null
}

type TDQuoteRaw = {
  symbol?: string
  close?: string
  previous_close?: string
  change?: string
  percent_change?: string
  is_market_open?: boolean
  status?: string
  code?: number
}

/**
 * Batch fetch quotes for many pairs in ONE API call. Pass canonical pair
 * symbols (XAUUSD, EURUSD, ...). Unsupported pairs are silently dropped from
 * the result map — the orchestrator checks `tdSymbol()` first to filter.
 */
export async function tdQuotes(
  pairs: string[],
  apiKey: string,
): Promise<Map<string, TDQuote>> {
  const result = new Map<string, TDQuote>()

  // Map canonical pair → TD symbol; preserve relationship for the response.
  const tdToCanonical = new Map<string, string>()
  for (const p of pairs) {
    const td = tdSymbol(p)
    if (td) tdToCanonical.set(td, p.toUpperCase())
  }
  if (tdToCanonical.size === 0) return result

  const symbolList = Array.from(tdToCanonical.keys()).join(',')
  const url =
    `${TD_BASE}/quote` +
    `?symbol=${encodeURIComponent(symbolList)}` +
    `&apikey=${apiKey}`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`twelvedata ${res.status}`)
  const data: unknown = await res.json()

  // Single symbol: returns flat object. Multi: returns object keyed by symbol.
  const items: Record<string, TDQuoteRaw> =
    tdToCanonical.size === 1
      ? { [Array.from(tdToCanonical.keys())[0]]: data as TDQuoteRaw }
      : (data as Record<string, TDQuoteRaw>)

  for (const [tdSym, canonical] of tdToCanonical) {
    const item = items[tdSym]
    if (!item || item.status === 'error' || item.code != null) continue
    const price = parseFloatOrNull(item.close)
    const prev = parseFloatOrNull(item.previous_close)
    const change = parseFloatOrNull(item.change)
    const changePercent = parseFloatOrNull(item.percent_change)
    if (price == null) continue
    result.set(canonical, {
      symbol: canonical,
      price,
      prev,
      change,
      changePercent,
    })
  }

  return result
}

export type TDBar = {
  time: number // unix seconds, UTC
  open: number
  high: number
  low: number
  close: number
}

/**
 * OHLC time series. Returns oldest-first (lightweight-charts expects that).
 * Returns null if the pair isn't supported on TD.
 */
export async function tdTimeSeries(
  pair: string,
  interval: Interval,
  apiKey: string,
  outputsize = 200,
): Promise<TDBar[] | null> {
  const sym = tdSymbol(pair)
  if (!sym) return null
  const tdInt = INTERVAL_MAP[interval]
  if (!tdInt) return null

  const url =
    `${TD_BASE}/time_series` +
    `?symbol=${encodeURIComponent(sym)}` +
    `&interval=${tdInt}` +
    `&outputsize=${outputsize}` +
    `&order=ASC` +
    `&apikey=${apiKey}`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`twelvedata ${res.status}`)
  const data = (await res.json()) as {
    status?: string
    message?: string
    values?: Array<{
      datetime?: string
      open?: string
      high?: string
      low?: string
      close?: string
    }>
  }

  if (data.status === 'error') {
    throw new Error(data.message ?? 'twelvedata error')
  }

  const values = data.values ?? []
  const bars: TDBar[] = []
  for (const v of values) {
    if (!v.datetime) continue
    const time = parseUtcDatetime(v.datetime)
    const open = parseFloatOrNull(v.open)
    const high = parseFloatOrNull(v.high)
    const low = parseFloatOrNull(v.low)
    const close = parseFloatOrNull(v.close)
    if (
      !Number.isFinite(time) ||
      open == null ||
      high == null ||
      low == null ||
      close == null
    )
      continue
    bars.push({ time, open, high, low, close })
  }
  return bars
}

/* utils */

function parseFloatOrNull(s: string | undefined | null): number | null {
  if (s == null) return null
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? n : null
}

/** "YYYY-MM-DD HH:MM:SS" → unix seconds (UTC). Also accepts "YYYY-MM-DD". */
function parseUtcDatetime(s: string): number {
  const parts = s.split(' ')
  const [date, time = '00:00:00'] = parts
  const [y, m, d] = date.split('-').map(Number)
  const [hh = 0, mm = 0, ss = 0] = time.split(':').map(Number)
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d)
  )
    return NaN
  return Math.floor(Date.UTC(y, m - 1, d, hh, mm, ss) / 1000)
}
