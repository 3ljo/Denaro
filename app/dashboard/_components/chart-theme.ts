import {
  ColorType,
  type ChartOptions,
  type DeepPartial,
  type CandlestickSeriesPartialOptions,
} from 'lightweight-charts'

/**
 * Shared lightweight-charts styling — no grid, neutral B&W candles, cyan
 * borders, gold crosshair. Used by both DenaroChart (per-pair) and the
 * VisionCard mini timeframe charts.
 */
export const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  autoSize: true,
  layout: {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor: 'rgba(186, 230, 253, 0.65)',
    fontFamily:
      'var(--font-orbitron), ui-monospace, SFMono-Regular, monospace',
    fontSize: 11,
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { visible: false },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    borderColor: 'rgba(125, 211, 252, 0.2)',
  },
  rightPriceScale: {
    borderColor: 'rgba(125, 211, 252, 0.2)',
  },
  crosshair: {
    vertLine: {
      color: 'rgba(251, 191, 36, 0.55)',
      width: 1,
      style: 3,
      labelBackgroundColor: 'rgba(251, 191, 36, 0.85)',
    },
    horzLine: {
      color: 'rgba(251, 191, 36, 0.55)',
      width: 1,
      style: 3,
      labelBackgroundColor: 'rgba(251, 191, 36, 0.85)',
    },
  },
}

export const CANDLE_OPTIONS: CandlestickSeriesPartialOptions = {
  upColor: '#f1f5f9',         // near-white body for bullish candles
  downColor: '#1f2937',       // near-black body for bearish candles
  borderUpColor: '#e2e8f0',
  borderDownColor: '#94a3b8',
  wickUpColor: '#cbd5e1',
  wickDownColor: '#94a3b8',
}
