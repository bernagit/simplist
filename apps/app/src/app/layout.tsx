import type { Metadata } from 'next'

import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import AppLayout from '@/components/layouts/AppLayout'
import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/dates/styles.css'
import './layout.css'

export const metadata: Metadata = {
  title: 'Simplist',
  description: 'Manage your tasks and lists with ease using Simplist.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const theme = createTheme({
    primaryColor: 'pink',
    defaultRadius: 'md'
  })

  return (
    <html lang="en" {...mantineHtmlProps} className="vsc-initialized">
      <head>
        <ColorSchemeScript />
      </head>
      <body className="vsc-initialized">
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <Notifications zIndex={1000} />
          <AppLayout>{children}</AppLayout>
        </MantineProvider>
      </body>
    </html>
  )
}
