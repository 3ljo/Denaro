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
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // Dev also needs the HMR websocket back to localhost.
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}${isDev ? ' ws://localhost:* http://localhost:*' : ''}`,
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
