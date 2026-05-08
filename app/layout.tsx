import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, Poppins, Barlow } from 'next/font/google'
import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getDir, type Locale } from '@/i18n/config'
import './globals.css'
import './template-globals.scss'
import ServiceWorkerRegister from './sw-register'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

// Template fonts — names + CSS-var keys must match what
// app/_landing/assets/scss/utils/_typography.scss expects.
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--tg-body-font-family',
  display: 'swap',
})

const barlow = Barlow({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--tg-heading-font-family',
  display: 'swap',
})

const berlin = localFont({
  src: [
    {
      path: './_landing/assets/fonts/berlin_sans_fb_demi_bold-webfont.woff2',
      weight: 'normal',
      style: 'normal',
    },
    {
      path: './_landing/assets/fonts/berlin_sans_fb_demi_bold-webfont.woff',
      weight: 'normal',
      style: 'normal',
    },
  ],
  variable: '--tg-berlin-font-family',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Denaro — AI Trading Analyst',
    template: '%s · Denaro',
  },
  description: 'AI trading analyst — multi-timeframe reads, live news, and a 24/7 channel that thinks in your strategy.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Denaro',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Denaro',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#050810',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const dir = getDir(locale as Locale)
  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${orbitron.variable} ${poppins.variable} ${barlow.variable} ${berlin.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-[var(--dash-bg,#050810)] font-sans text-cyan-50 antialiased"
      >
        {/* Pre-hydration: applies the user's saved background brightness
            globally, before first paint, so navigation between dashboard
            and other authenticated pages doesn't flash back to dark. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var b=localStorage.getItem('denaro-bg');var m={cosmos:'#050810','deep-navy':'#0a1424',navy:'#0d1a2e',twilight:'#142844',slate:'#1f3a5e',dusk:'#4a648c'};if(b&&m[b]&&document.body){document.body.style.setProperty('--dash-bg',m[b]);}}catch(e){}})();",
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
