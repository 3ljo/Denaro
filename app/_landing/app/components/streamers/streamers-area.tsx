"use client";
import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import TextAnimation from "../common/text-animation";

type MarketCategory = "FX" | "Crypto" | "Metal" | "Index" | "Energy";

type Market = {
  id: number;
  symbol: string;
  name: string;
  category: MarketCategory;
  change: number;
};

const markets_data: Market[] = [
  { id: 1,  symbol: "XAUUSD", name: "Gold / USD",     category: "Metal",  change:  0.42 },
  { id: 2,  symbol: "EURUSD", name: "Euro / USD",     category: "FX",     change: -0.18 },
  { id: 3,  symbol: "BTCUSD", name: "Bitcoin",        category: "Crypto", change:  1.85 },
  { id: 4,  symbol: "GBPUSD", name: "Pound / USD",    category: "FX",     change:  0.22 },
  { id: 5,  symbol: "USDJPY", name: "USD / Yen",      category: "FX",     change: -0.31 },
  { id: 6,  symbol: "ETHUSD", name: "Ethereum",       category: "Crypto", change:  2.14 },
  { id: 7,  symbol: "NAS100", name: "Nasdaq 100",     category: "Index",  change:  0.67 },
  { id: 8,  symbol: "SPX500", name: "S&P 500",        category: "Index",  change:  0.41 },
  { id: 9,  symbol: "US30",   name: "Dow Jones",      category: "Index",  change:  0.28 },
  { id: 10, symbol: "XAGUSD", name: "Silver / USD",   category: "Metal",  change: -0.55 },
  { id: 11, symbol: "USOIL",  name: "WTI Crude",      category: "Energy", change: -0.92 },
  { id: 12, symbol: "UKOIL",  name: "Brent Oil",      category: "Energy", change: -0.74 },
  { id: 13, symbol: "AUDUSD", name: "Aussie / USD",   category: "FX",     change:  0.13 },
  { id: 14, symbol: "USDCAD", name: "USD / Canadian", category: "FX",     change: -0.08 },
  { id: 15, symbol: "EURGBP", name: "Euro / Pound",   category: "FX",     change:  0.05 },
  { id: 16, symbol: "SOLUSD", name: "Solana",         category: "Crypto", change:  3.42 },
  { id: 17, symbol: "DAX40",  name: "Germany 40",     category: "Index",  change:  0.55 },
  { id: 18, symbol: "UK100",  name: "FTSE 100",       category: "Index",  change:  0.18 },
  { id: 19, symbol: "JP225",  name: "Nikkei 225",     category: "Index",  change: -0.22 },
  { id: 20, symbol: "NZDUSD", name: "Kiwi / USD",     category: "FX",     change:  0.09 },
  { id: 21, symbol: "USDCHF", name: "USD / Swiss",    category: "FX",     change: -0.14 },
  { id: 22, symbol: "EURJPY", name: "Euro / Yen",     category: "FX",     change: -0.27 },
  { id: 23, symbol: "GBPJPY", name: "Pound / Yen",    category: "FX",     change: -0.05 },
  { id: 24, symbol: "XRPUSD", name: "Ripple",         category: "Crypto", change:  0.96 },
];

// =============================================================================
// Icon system — every pair gets a single icon (or two for forex pairs) with
// a TONE color baked in that represents the asset itself: BTC orange, ETH
// purple, gold gold, oil amber, USD greenback green, EUR blue, etc. The tone
// drives the ring color via CSS custom property, keeping all icons unified
// in size + framing while giving each its own identity.
// =============================================================================

const CURRENCY_TO_FLAG: Record<string, string> = {
  USD: "us", EUR: "eu", GBP: "gb", JPY: "jp", CHF: "ch",
  AUD: "au", CAD: "ca", NZD: "nz", CNY: "cn", HKD: "hk",
};

// Color that *represents* each currency (its national / brand identity).
const CURRENCY_TONE: Record<string, string> = {
  USD: "22c55e", // greenback green
  EUR: "3b82f6", // EU blue
  GBP: "8b5cf6", // royal purple
  JPY: "ef4444", // Japanese red
  CHF: "ef4444", // Swiss red
  AUD: "1e40af", // Australian deep blue
  CAD: "ef4444", // Canadian red
  NZD: "475569", // NZ silver fern slate
};

// Crypto brand tones.
const CRYPTO_TONE: Record<string, string> = {
  btc: "f7931a", // Bitcoin orange
  eth: "627eea", // Ethereum purple
  sol: "14f195", // Solana teal
  xrp: "0ea5e9", // Ripple cyan
};

// Index → flag + brand tone (US tech blue, S&P green, FTSE red, etc.).
const INDEX_SPEC: Record<string, { flag: string; tone: string }> = {
  NAS100: { flag: "us", tone: "0ea5e9" }, // tech blue
  SPX500: { flag: "us", tone: "22c55e" }, // S&P green
  US30:   { flag: "us", tone: "22c55e" }, // Dow green
  DAX40:  { flag: "de", tone: "facc15" }, // German gold/yellow
  UK100:  { flag: "gb", tone: "ef4444" }, // FTSE red
  JP225:  { flag: "jp", tone: "ef4444" }, // Nikkei red
};

const flagUrl    = (cc: string) => `https://flagcdn.com/${cc.toLowerCase()}.svg`;
const cryptoUrl  = (sym: string) => `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${sym.toLowerCase()}.svg`;
const iconifyUrl = (icon: string, color: string) => `https://api.iconify.design/${icon}.svg?color=%23${color}`;

type IconSpec =
  | { kind: "pair"; baseFlag: string; quoteFlag: string; baseLabel: string; quoteLabel: string; tone: string }
  | { kind: "image"; url: string; tone: string; contain?: boolean }
  | { kind: "letter"; letter: string; tone: string };

function getIconSpec(symbol: string, category: MarketCategory): IconSpec {
  if (category === "FX") {
    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3, 6);
    return {
      kind: "pair",
      baseFlag: CURRENCY_TO_FLAG[base] || "xx",
      quoteFlag: CURRENCY_TO_FLAG[quote] || "xx",
      baseLabel: base,
      quoteLabel: quote,
      tone: CURRENCY_TONE[base] || "fbbf24",
    };
  }
  if (category === "Crypto") {
    const sym = symbol.slice(0, 3).toLowerCase();
    return { kind: "image", url: cryptoUrl(sym), tone: CRYPTO_TONE[sym] || "fbbf24" };
  }
  if (category === "Index") {
    const spec = INDEX_SPEC[symbol] || { flag: "us", tone: "8b5cf6" };
    return { kind: "image", url: flagUrl(spec.flag), tone: spec.tone };
  }
  if (category === "Metal") {
    if (symbol.startsWith("XAU")) return { kind: "image", url: iconifyUrl("material-symbols:paid", "fbbf24"), tone: "fbbf24", contain: true };
    if (symbol.startsWith("XAG")) return { kind: "image", url: iconifyUrl("material-symbols:paid", "e5e7eb"), tone: "d1d5db", contain: true };
  }
  if (category === "Energy") {
    if (symbol === "USOIL") return { kind: "image", url: iconifyUrl("material-symbols:oil-barrel", "fb923c"), tone: "fb923c", contain: true };
    if (symbol === "UKOIL") return { kind: "image", url: iconifyUrl("mdi:barrel", "fb923c"),                  tone: "fb923c", contain: true };
  }
  return { kind: "letter", letter: symbol.slice(0, 3), tone: "fbbf24" };
}

function PairIcon({ symbol, category }: { symbol: string; category: MarketCategory }) {
  const spec = getIconSpec(symbol, category);
  const style = { ["--icon-tone" as string]: `#${spec.tone}` } as React.CSSProperties;

  if (spec.kind === "pair") {
    return (
      <div className="market__icon market__icon--pair" style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="market__icon-img market__icon-img--quote" src={flagUrl(spec.quoteFlag)} alt={spec.quoteLabel} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="market__icon-img market__icon-img--base"  src={flagUrl(spec.baseFlag)}  alt={spec.baseLabel} />
      </div>
    );
  }

  if (spec.kind === "image") {
    return (
      <div className={`market__icon market__icon--single ${spec.contain ? "market__icon--contain" : ""}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="market__icon-img" src={spec.url} alt={symbol} />
      </div>
    );
  }

  return (
    <div className="market__icon market__icon--letter" style={style}>
      <span className="market__icon-text">{spec.letter}</span>
    </div>
  );
}

// Deterministic SVG sparkline — same symbol always renders the same shape,
// so the "live" market grid stays visually stable between renders. Up days
// trend down-to-up; down days trend up-to-down. Pure CSS-friendly, no data.
function MarketSparkline({ symbol, isUp }: { symbol: string; isUp: boolean }) {
  const { areaPath, linePath } = useMemo(() => {
    let h = 0;
    for (let i = 0; i < symbol.length; i++) {
      h = ((h << 5) - h) + symbol.charCodeAt(i);
      h |= 0;
    }
    const n = 30;
    const w = 280;
    const hgt = 140;
    const pad = 10;
    const stepX = (w - pad * 2) / (n - 1);

    const pts: { x: number; y: number }[] = [];
    let v = 0.5;
    for (let i = 0; i < n; i++) {
      const a = Math.sin(h * 0.013 + i * 0.41) * 0.16;
      const b = Math.sin(h * 0.029 + i * 0.93) * 0.10;
      const c = (Math.sin(h * 0.051 + i * 1.7) + Math.cos(h * 0.011 + i * 2.1)) * 0.08;
      const drift = (isUp ? -1 : 1) * (i / n) * 0.55;
      v = Math.max(0.1, Math.min(0.9, 0.5 + a + b + c + drift));
      pts.push({ x: pad + i * stepX, y: pad + (1 - v) * (hgt - pad * 2) });
    }
    const linePath = pts
      .map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)},${p.y.toFixed(2)}` : ` L ${p.x.toFixed(2)},${p.y.toFixed(2)}`))
      .join("");
    const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)},${hgt} L ${pts[0].x.toFixed(2)},${hgt} Z`;
    return { areaPath, linePath };
  }, [symbol, isUp]);

  const stroke = isUp ? "#34d399" : "#f87171";
  const fillStart = isUp ? "rgba(52, 211, 153, 0.32)" : "rgba(248, 113, 113, 0.30)";
  const gid = `mkt-grad-${symbol}`;

  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="none" className="market-spark" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillStart} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const slider_setting = {
  observer: true,
  observeParents: true,
  loop: true,
  slidesPerView: 5,
  spaceBetween: 20,
  speed: 700,
  autoplay: {
    delay: 1000,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
    waitForTransition: false,
  },
  breakpoints: {
    "1500": { slidesPerView: 5, spaceBetween: 20 },
    "1200": { slidesPerView: 4, spaceBetween: 20 },
    "992":  { slidesPerView: 4, spaceBetween: 20 },
    "768":  { slidesPerView: 3, spaceBetween: 18 },
    "576":  { slidesPerView: 2, spaceBetween: 14 },
    "0":    { slidesPerView: 1.15, spaceBetween: 12 },
  },
  pagination: { el: ".swiper-pagination", clickable: true, dynamicBullets: true, dynamicMainBullets: 3 },
};

const MarketsArea = () => {
  return (
    <section id="features" className="streamers__area markets__area section-pt-95 section-pb-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-7 col-lg-8 col-md-10">
            <div className="section__title text-center mb-60">
              <TextAnimation title="The markets we watch" />
              <h3 className="title">live across every pair</h3>
            </div>
          </div>
        </div>
        <Swiper {...slider_setting} modules={[Pagination, Autoplay]} className="swiper-container streamers-active markets-active">
          {markets_data.map((m) => {
            const isUp = m.change >= 0;
            return (
              <SwiperSlide key={m.id}>
                <div className="streamers__item market__item">
                  <div className="streamers__thumb market__thumb">
                    <PairIcon symbol={m.symbol} category={m.category} />
                    <span className={`market__change ${isUp ? "is-up" : "is-down"}`}>
                      {isUp ? "▲" : "▼"} {Math.abs(m.change).toFixed(2)}%
                    </span>
                    <MarketSparkline symbol={m.symbol} isUp={isUp} />
                  </div>
                  <div className="streamers__content market__content">
                    <h4 className="name market__symbol">{m.symbol}</h4>
                    <p className="market__name">{m.name}</p>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="streamers__pagination">
          <div className="swiper-pagination streamers__pagination-dots"></div>
        </div>
      </div>
    </section>
  );
};

export default MarketsArea;
