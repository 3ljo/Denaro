export type Strategy =
  | 'smc'
  | 'price-action'
  | 'trend'
  | 'mean-reversion'
  | 'scalping'
  | 'swing'

export type Profile = {
  id: string
  email: string
  display_name: string | null
  pairs: string[]
  strategy: Strategy
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

export const STRATEGIES: Strategy[] = [
  'smc',
  'price-action',
  'trend',
  'mean-reversion',
  'scalping',
  'swing',
]

export const STRATEGY_LABEL: Record<Strategy, string> = {
  'smc': 'Smart Money Concepts',
  'price-action': 'Price Action',
  'trend': 'Trend Following',
  'mean-reversion': 'Mean Reversion',
  'scalping': 'Scalping',
  'swing': 'Swing Trading',
}

export const STRATEGY_BLURB: Record<Strategy, string> = {
  'smc': 'Institutional order flow. BoS, CHoCH, order blocks, FVGs, liquidity sweeps.',
  'price-action': 'Pure structure. Supply / demand zones, candlestick reads, market profile.',
  'trend': 'Ride the dominant trend. Breakouts, pullback entries, momentum continuation.',
  'mean-reversion': 'Fade extremes. Range plays, exhaustion entries at range bounds.',
  'scalping': 'Fast intraday. M1–M15 setups, high frequency, tight risk.',
  'swing': 'Multi-day positions. HTF bias (D1+H4), patient entries, extended TPs.',
}

export const POPULAR_PAIRS: { symbol: string; group: 'forex' | 'metals' | 'crypto' | 'index' | 'commodity' }[] = [
  { symbol: 'XAUUSD', group: 'metals' },
  { symbol: 'EURUSD', group: 'forex' },
  { symbol: 'GBPUSD', group: 'forex' },
  { symbol: 'USDJPY', group: 'forex' },
  { symbol: 'AUDUSD', group: 'forex' },
  { symbol: 'USDCAD', group: 'forex' },
  { symbol: 'NZDUSD', group: 'forex' },
  { symbol: 'EURJPY', group: 'forex' },
  { symbol: 'GBPJPY', group: 'forex' },
  { symbol: 'BTCUSD', group: 'crypto' },
  { symbol: 'ETHUSD', group: 'crypto' },
  { symbol: 'NAS100', group: 'index' },
  { symbol: 'SPX500', group: 'index' },
  { symbol: 'US30',   group: 'index' },
  { symbol: 'GER40',  group: 'index' },
  { symbol: 'UK100',  group: 'index' },
  { symbol: 'OIL',    group: 'commodity' },
  { symbol: 'SILVER', group: 'metals' },
]

export function isStrategy(value: unknown): value is Strategy {
  return typeof value === 'string' && (STRATEGIES as string[]).includes(value)
}
