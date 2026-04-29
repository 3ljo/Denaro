/**
 * One-click prompt scaffolds shown as chips above the chat input.
 * Picking one drops the template into the input — the operator fills in the
 * placeholders ([asset], [timeframe], [paste data here]) before sending.
 */
export type QuickPrompt = {
  id: string
  label: string
  /** Built lazily so {today} resolves at click time, not module-load time. */
  build: () => string
}

const today = () => new Date().toISOString().slice(0, 10)

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'trend',
    label: 'Trend ID',
    build: () =>
      'You are a professional price action analyst. Analyse [asset] on [timeframe]. Using only structure, identify: 1) Trend phase (impulse/correction/range) 2) Key HH/HL or LH/LL points 3) Where trend invalidates 4) Next probable move. Be concise. No indicators.',
  },
  {
    id: 'csv',
    label: 'CSV Trade Review',
    build: () =>
      'I am attaching my broker trade history as a CSV. Analyse it and give me: 1) Win rate by session 2) Best & worst performing pair 3) Avg RR achieved vs planned 4) My most common mistake 5) 3 rules to add based on data.\n\n[paste CSV here]',
  },
  {
    id: 'mtf',
    label: 'Multi-TF (4H/1H/15M)',
    build: () =>
      'I am attaching 3 chart screenshots: 4H, 1H, 15M. Act as an SMC analyst. Give me: 1) HTF bias from 4H structure 2) Key levels on 1H 3) Entry zone on 15M 4) Bias direction + reason 5) What invalidates this setup?\n\n[describe each chart here]',
  },
  {
    id: 'stock',
    label: 'Stock Screener',
    build: () =>
      'Here is the screener data for [stock name]: [paste data here]. Analyse and give me: 1) Fundamental strength score 2) Key technical levels 3) Buy or avoid at current price? 4) Risk factors to watch 5) Price targets with invalidation.',
  },
  {
    id: 'xauusd',
    label: 'XAUUSD Daily',
    build: () =>
      `Act as a senior XAUUSD analyst. Today is ${today()}. Using price action give: 1) Trend direction (D1+4H) 2) Key support levels 3) Key resistance levels 4) Reversal zones 5) Bias (bullish/bearish/range).`,
  },
]
