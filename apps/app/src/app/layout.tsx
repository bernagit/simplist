import type { Metadata, Viewport } from 'next'

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

import AppLayout from '@/components/layouts/AppLayout'
import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/schedule/styles.css'
import 'mantine-contextmenu/styles.layer.css'
import '@gfazioli/mantine-onboarding-tour/styles.layer.css'
import './layout.css'
import { ContextMenuProvider } from 'mantine-contextmenu'
import PWARegister from '@/components/PWARegister'
import { ThemeColorProvider } from '@/providers/ThemeColorProvider'
import { AppMantineProvider } from '@/providers/AppMantineProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { hasSessionCookie } from '@/lib/auth'
import { DayjsProvider } from '@/providers/DayjsProvider'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')

  return {
    title: t('title'),
    description: t('description'),
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      title: t('title'),
      statusBarStyle: 'default'
    },
    icons: {
      apple: '/icons/apple-touch-icon.png'
    }
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
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} {...mantineHtmlProps} className="vsc-initialized">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="vsc-initialized">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <PWARegister />
          <QueryProvider>
            <AuthProvider hasSessionCookie={sessionCookiePresent}>
              <ThemeColorProvider>
                <AppMantineProvider>
                  <Notifications withAutoCloseProgress zIndex={1000} />
                  <ContextMenuProvider>
                    <DayjsProvider>
                      <AppLayout>
                        {children}
                      </AppLayout>
                    </DayjsProvider>
                  </ContextMenuProvider>
                </AppMantineProvider>
              </ThemeColorProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}