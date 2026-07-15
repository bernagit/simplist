'use client'

import { useMemo, ReactNode } from 'react'
import { MantineProvider, createTheme } from '@mantine/core'
import { useThemeColor } from './ThemeColorProvider'

export function AppMantineProvider({ children }: { children: ReactNode }) {
  const { themeColor } = useThemeColor()

  const theme = useMemo(
    () =>
      createTheme({
        primaryColor: themeColor,
        defaultRadius: 'md'
      }),
    [themeColor]
  )

  return (
    <MantineProvider defaultColorScheme="auto" theme={theme}>
      {children}
    </MantineProvider>
  )
}
