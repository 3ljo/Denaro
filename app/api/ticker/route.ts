/**
 * Live ticker — TwelveData primary, Yahoo fallback. fetchSpotPrices() does
 * a single batched TD /quote call for all eligible pairs in one network
 * round-trip; only un-mapped or failed pairs fall through to Yahoo.
 */

import { fetchSpotPrices } from '@/lib/market/price'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbols = (url.searchParams.get('symbols') ?? '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 8)

  if (symbols.length === 0) return Response.json([])

  const results = await fetchSpotPrices(symbols)
  return Response.json(results, { headers: { 'Cache-Control': 'no-store' } })
}
