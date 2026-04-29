/**
 * Economic-event "news feed" — sourced from the Forex Factory weekly
 * calendar mirror (faireconomy.media). Replaces the previous Yahoo-articles
 * feed because operators want scheduled-event timing, countdown, and a
 * live-state indicator — concepts that don't apply to already-published
 * articles.
 *
 * Feed times are GMT/UTC.
 *
 * Type names kept as `NewsItem` / `Impact` so existing imports keep working
 * — the SHAPE has changed but the role is the same: "headlines for this pair".
 */

const FEED_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.xml'

const PAIR_TO_CURRENCIES: Record<string, string[]> = {
  XAUUSD: ['USD'],
  EURUSD: ['USD', 'EUR'],
  GBPUSD: ['USD', 'GBP'],
  USDJPY: ['USD', 'JPY'],
  AUDUSD: ['USD', 'AUD'],
  USDCAD: ['USD', 'CAD'],
  NZDUSD: ['USD', 'NZD'],
  EURJPY: ['EUR', 'JPY'],
  GBPJPY: ['GBP', 'JPY'],
  BTCUSD: ['USD'],
  ETHUSD: ['USD'],
  NAS100: ['USD'],
  SPX500: ['USD'],
  US30: ['USD'],
  GER40: ['EUR'],
  UK100: ['GBP'],
  OIL: ['USD'],
  SILVER: ['USD'],
}

export type Impact = 'high' | 'medium' | 'low'

export type NewsItem = {
  id: string
  /** Event name, e.g. "Federal Funds Rate" */
  title: string
  /** 3-letter currency, e.g. "USD" */
  currency: string
  /** Scheduled time, unix seconds UTC */
  timeUtc: number
  impact: Impact
  forecast: string
  previous: string
  url: string
}

export async function fetchNews(symbol: string, count = 8): Promise<NewsItem[]> {
  const upper = symbol.toUpperCase()
  const allowed = new Set(PAIR_TO_CURRENCIES[upper] ?? ['USD'])

  try {
    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 Denaro' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const xml = await res.text()
    const all = parseEvents(xml)

    const nowSec = Math.floor(Date.now() / 1000)
    return all
      .filter((e) => allowed.has(e.currency))
      // High + medium only — low impact = noise. Holidays already filtered.
      .filter((e) => e.impact !== 'low')
      // Drop deeply-past events (>2h ago) but keep recent ones so "+15m" reads.
      .filter((e) => e.timeUtc > nowSec - 2 * 3600)
      .sort((a, b) => a.timeUtc - b.timeUtc)
      .slice(0, count)
  } catch {
    return []
  }
}

/* --------------- XML parsing --------------- */

function parseEvents(xml: string): NewsItem[] {
  const events: NewsItem[] = []
  const re = /<event>([\s\S]*?)<\/event>/g
  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null) {
    const body = match[1]
    const title = extract(body, 'title')
    const currency = extract(body, 'country')
    const date = extract(body, 'date')
    const time = extract(body, 'time')
    const impactStr = (extract(body, 'impact') ?? '').toLowerCase()
    const forecast = extract(body, 'forecast') ?? ''
    const previous = extract(body, 'previous') ?? ''
    const url = extract(body, 'url') ?? ''

    if (!title || !currency || !date) continue
    if (impactStr === 'holiday') continue

    let impact: Impact
    if (impactStr === 'high') impact = 'high'
    else if (impactStr === 'medium') impact = 'medium'
    else impact = 'low'

    const t = parseDateTime(date, time)
    if (!t) continue

    events.push({
      id: `${date}-${time}-${currency}-${title}`.replace(/\s+/g, '_'),
      title,
      currency,
      timeUtc: Math.floor(t.getTime() / 1000),
      impact,
      forecast,
      previous,
      url,
    })
  }
  return events
}

function extract(body: string, tag: string): string {
  // Tries CDATA first, then falls back to plain text.
  const cdata = new RegExp(
    `<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
  ).exec(body)
  if (cdata) return cdata[1].trim()
  const plain = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(body)
  if (plain) return plain[1].trim()
  return ''
}

function parseDateTime(date: string, time: string): Date | null {
  // date format: "04-29-2026"  (mm-dd-yyyy)
  const dateMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!dateMatch) return null
  const month = Number(dateMatch[1])
  const day = Number(dateMatch[2])
  const year = Number(dateMatch[3])

  // time format: "8:00pm" / "10:00am". Skip "All Day" / "Tentative".
  const timeMatch = time?.match(/^(\d{1,2}):(\d{2})(am|pm)$/i)
  if (!timeMatch) return null
  let hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])
  const meridiem = timeMatch[3].toLowerCase()
  if (meridiem === 'pm' && hour < 12) hour += 12
  if (meridiem === 'am' && hour === 12) hour = 0

  // Feed mirror serves UTC.
  return new Date(Date.UTC(year, month - 1, day, hour, minute))
}
