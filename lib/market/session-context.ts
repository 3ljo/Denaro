/**
 * Server-side market context for the Denaro AI prompts.
 * Forex/CFD-leaning: weekend = Saturday all day + Sunday before 22:00 UTC
 * (forex opens Sunday 22:00 UTC = Monday 07:00 Sydney).
 * Session windows are UTC and approximate.
 */

export type Session = 'sydney' | 'tokyo' | 'london' | 'new-york' | 'closed'

export type MarketContext = {
  isWeekend: boolean
  session: Session
  sessionLabel: string
  block: string
}

export function getMarketContext(now: Date = new Date()): MarketContext {
  const day = now.getUTCDay() // 0 = Sun, 6 = Sat
  const hour = now.getUTCHours()

  const isWeekend =
    day === 6 || (day === 0 && hour < 22)

  const session: Session = isWeekend
    ? 'closed'
    : hour >= 22 || hour < 7
      ? 'sydney'
      : hour < 9
        ? 'tokyo'
        : hour < 12
          ? 'london'
          : hour < 16
            ? 'london' // London/NY overlap, primary = London/NY
            : hour < 21
              ? 'new-york'
              : 'closed'

  const sessionLabel = (
    {
      sydney: 'Sydney',
      tokyo: 'Tokyo',
      london: 'London',
      'new-york': 'New York',
      closed: 'closed',
    } as const
  )[session]

  const date = now.toISOString().slice(0, 10)
  const utcTime = `${String(hour).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`

  const block = isWeekend
    ? `Date: ${date} (${dayName(day)}). Time: ${utcTime}.\nMarkets are CLOSED — it is the weekend (forex/CFDs reopen Sunday 22:00 UTC).`
    : `Date: ${date} (${dayName(day)}). Time: ${utcTime}.\nActive session: ${sessionLabel}.`

  return { isWeekend, session, sessionLabel, block }
}

function dayName(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] ?? ''
}
