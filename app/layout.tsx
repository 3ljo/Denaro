import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
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

export const metadata: Metadata = {
  title: 'Denaro // Auth',
  description: 'Denaro secure access portal',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-dvh bg-denaro-bg font-sans text-cyan-50 antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
