/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

const nextConfig = {
  // Security headers — applied to every response.
  // Defense in depth: even if the app has bugs, these reduce blast radius.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent the page from being framed (clickjacking protection)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Don't sniff MIME types
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak referrers cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS — force HTTPS for a year (only enable in production)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Disable browser features we don't use
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy — the big one. This blocks XSS even if
          // an attacker manages to inject a script.
          // NOTE: Tighten this further once you know what domains you load.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Dev needs 'unsafe-eval' for Next.js's React Refresh / HMR runtime.
              // Production stays strict.
              // TradingView chart embed loads its bootstrap script from s3.tradingview.com.
              `script-src 'self' 'unsafe-inline' https://s3.tradingview.com https://*.tradingview.com${isDev ? " 'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // Dev also needs the HMR websocket back to localhost.
              // TradingView script makes XHR/WS calls to its data endpoints.
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''} https://*.tradingview.com https://*.tradingview-widget.com wss://*.tradingview.com${isDev ? ' ws://localhost:* http://localhost:*' : ''}`,
              // TradingView chart + ticker-tape iframes (Markets tab + ticker bar).
              // Without this, frame-src falls back to default-src 'self' and the
              // iframes render as blank panels.
              "frame-src https://s.tradingview.com https://www.tradingview.com https://www.tradingview-widget.com https://*.tradingview.com https://*.tradingview-widget.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
