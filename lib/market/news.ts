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

export type Impact = 'high' | 'medium' | 'low'

export type NewsItem = {
  title: string
  publisher: string
  link: string
  publishedAt: number // unix seconds
  thumbnail?: string
  impact: Impact
}

/**
 * Heuristic impact classifier. Yahoo doesn't return impact level so we
 * tag headlines by keyword. Conservative — when in doubt, return 'low'
 * (which gets filtered out before reaching the dashboard).
 */
const HIGH_IMPACT_KEYWORDS = [
  // Central banks / monetary policy
  'fed ', 'federal reserve', 'fomc', 'powell', 'rate hike', 'rate cut',
  'rate decision', 'interest rate', 'monetary policy',
  'ecb', 'lagarde', 'boe', 'boj', 'snb', 'rba', 'rbnz', 'pboc',
  // Macro data
  'cpi', 'inflation', 'core cpi', 'pce', 'gdp', 'nfp', 'non-farm',
  'nonfarm', 'payroll', 'unemployment', 'jobless', 'pmi',
  // Geopolitical / market-moving
  'war', 'invasion', 'ceasefire', 'sanction', 'tariff', 'trade war',
  'iran', 'russia', 'ukraine', 'israel', 'gaza', 'china',
  'recession', 'crisis', 'crash', 'plunge', 'soar', 'surge',
  // Policy / fiscal
  'stimulus', 'shutdown', 'debt ceiling', 'election',
  'opec', 'opec+',
] as const

const MEDIUM_IMPACT_KEYWORDS = [
  'retail sales', 'industrial production', 'manufacturing',
  'housing', 'consumer', 'sentiment', 'confidence', 'ism',
  'durable goods', 'trade balance', 'current account',
  'oil price', 'crude', 'inventories',
  'gold price', 'gold prices', 'silver price', 'metals',
  'earnings', 'guidance', 'forecast', 'outlook', 'target',
  'dollar', 'yen', 'euro', 'pound', 'currency',
  'yields', 'bond', 'treasury',
] as const

export function classifyImpact(title: string): Impact {
  const lc = title.toLowerCase()
  for (const k of HIGH_IMPACT_KEYWORDS) if (lc.includes(k)) return 'high'
  for (const k of MEDIUM_IMPACT_KEYWORDS) if (lc.includes(k)) return 'medium'
  return 'low'
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

  // Overshoot the fetch — we filter low-impact items out before returning.
  const fetchCount = Math.min(50, Math.max(20, count * 4))

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=${fetchCount}&quotesCount=0&enableFuzzyQuery=false`,
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
      .map((n) => ({
        title: n.title!,
        publisher: n.publisher ?? '',
        link: n.link!,
        publishedAt: n.providerPublishTime ?? 0,
        thumbnail:
          n.thumbnail?.resolutions?.find((r) => r.tag === 'original')?.url ??
          n.thumbnail?.resolutions?.[0]?.url,
        impact: classifyImpact(n.title!),
      }))
      // Only the main-impact headlines surface — low-impact noise is dropped.
      .filter((n) => n.impact !== 'low')
      // High first, then medium, then most recent first within each group.
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 }
        const r = rank[a.impact] - rank[b.impact]
        if (r !== 0) return r
        return b.publishedAt - a.publishedAt
      })
      .slice(0, count)
  } catch {
    return []
  }
}
