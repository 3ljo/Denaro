import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegister from './sw-register'

export const metadata: Metadata = {
  title: 'Auth System',
  description: 'Bulletproof Supabase auth',
  manifest: '/manifest.webmanifest',
  applicationName: 'Auth System',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Auth',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
