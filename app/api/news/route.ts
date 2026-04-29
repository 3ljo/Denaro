import { fetchNews } from '@/lib/market/news'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbol = (url.searchParams.get('symbol') ?? '').toUpperCase().trim()
  const countRaw = parseInt(url.searchParams.get('count') ?? '6', 10)
  const count = Math.max(1, Math.min(10, Number.isFinite(countRaw) ? countRaw : 6))

  if (!symbol) {
    return Response.json({ error: 'missing symbol' }, { status: 400 })
  }

  const items = await fetchNews(symbol, count)
  return Response.json(
    { symbol, items },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
