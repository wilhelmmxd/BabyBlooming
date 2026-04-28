import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { ChildrenProvider } from '@/lib/children-context'
import { SettingsProvider } from '@/lib/settings-context'
import { LogsProvider } from '@/lib/logs-context'
import { PresenceProvider } from '@/lib/presence-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'Baby Blooming - Parenting Tracker',
  description: 'A premium parenting companion for tracking sleep, feeding, growth, and precious moments.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a1f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ErrorBoundary>
            <AuthProvider>
              <ChildrenProvider>
                <SettingsProvider>
                  <LogsProvider>
                    <PresenceProvider>
                      {children}
                      <Analytics />
                    </PresenceProvider>
                  </LogsProvider>
                </SettingsProvider>
              </ChildrenProvider>
            </AuthProvider>
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
