/**
 * Free-tier ticker — proxies Yahoo Finance unofficial chart endpoint.
 * No API key needed. Returns last close + day change for a list of pairs.
 * Yahoo's data is delayed (15-20m for indices, ~real-time for FX/crypto)
 * and rate-limited — fine for a "what's it doing today" indicator.
 */

import { fetchSpotPrice } from '@/lib/market/price'

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

  const results = await Promise.all(symbols.map(fetchSpotPrice))
  return Response.json(results, { headers: { 'Cache-Control': 'no-store' } })
}
