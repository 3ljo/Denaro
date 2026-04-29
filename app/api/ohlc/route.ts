import { fetchOHLC, INTERVALS, type Interval } from '@/lib/market/ohlc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbol = (url.searchParams.get('symbol') ?? '').toUpperCase().trim()
  const interval = (url.searchParams.get('interval') ?? '15m') as Interval

  if (!symbol) {
    return Response.json({ error: 'missing symbol' }, { status: 400 })
  }
  if (!INTERVALS.includes(interval)) {
    return Response.json({ error: 'invalid interval' }, { status: 400 })
  }

  const bars = await fetchOHLC(symbol, interval)
  return Response.json(
    { symbol, interval, bars },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
