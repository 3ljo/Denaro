/**
 * News fetcher — Yahoo Finance unofficial search endpoint.
 * No API key. Returns recent headlines for a given pair.
 */

const PAIR_TO_QUERY: Record<string, string> = {
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

export type NewsItem = {
  title: string
  publisher: string
  link: string
  publishedAt: number // unix seconds
  thumbnail?: string
}

type YahooNews = {
  title?: string
  publisher?: string
  link?: string
  providerPublishTime?: number
  thumbnail?: { resolutions?: { url: string; tag: string }[] }
}

export async function fetchNews(symbol: string, count = 6): Promise<NewsItem[]> {
  const upper = symbol.toUpperCase()
  const q = PAIR_TO_QUERY[upper] ?? upper

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=${count}&quotesCount=0&enableFuzzyQuery=false`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 Denaro' },
        cache: 'no-store',
      },
    )
    if (!res.ok) return []
    const data = await res.json()
    const news: YahooNews[] = data?.news ?? []
    return news
      .filter((n): n is YahooNews & { title: string; link: string } =>
        Boolean(n?.title && n?.link),
      )
      .slice(0, count)
      .map((n) => ({
        title: n.title!,
        publisher: n.publisher ?? '',
        link: n.link!,
        publishedAt: n.providerPublishTime ?? 0,
        thumbnail:
          n.thumbnail?.resolutions?.find((r) => r.tag === 'original')?.url ??
          n.thumbnail?.resolutions?.[0]?.url,
      }))
  } catch {
    return []
  }
}
