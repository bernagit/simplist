import type { Metadata, Viewport } from 'next'

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import AppLayout from '@/components/layouts/AppLayout'
import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-contextmenu/styles.layer.css'
import './layout.css'
import { ContextMenuProvider } from 'mantine-contextmenu'
import PWARegister from '@/components/PWARegister'
import { ThemeColorProvider } from '@/providers/ThemeColorProvider'
import { AppMantineProvider } from '@/providers/AppMantineProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { hasSessionCookie } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Simplist',
  description: 'Manage your tasks and lists with ease using Simplist.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Simplist',
    statusBarStyle: 'default'
  },
  icons: {
    apple: '/icons/apple-touch-icon.png'
  }
}

export const viewport: Viewport = {
  themeColor: '#000000'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessionCookiePresent = await hasSessionCookie()

  return (
    <html lang="en" {...mantineHtmlProps} className="vsc-initialized">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="vsc-initialized">
        <PWARegister />
        <QueryProvider>
          <AuthProvider hasSessionCookie={sessionCookiePresent}>
            <ThemeColorProvider>
              <AppMantineProvider>
                <Notifications zIndex={1000} />
                <ContextMenuProvider>
                  <AppLayout>{children}</AppLayout>
                </ContextMenuProvider>
              </AppMantineProvider>
            </ThemeColorProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
