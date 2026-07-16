'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import type { MantineColor } from '@mantine/core'
import { useAuth } from './AuthProvider'
import { usePreferences, useUpdatePreferences } from '@/queries/preferences'

export const AVAILABLE_THEME_COLORS: MantineColor[] = [
  'dark',
  'gray',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange'
]

type ThemeColorContextValue = {
  themeColor: MantineColor
  setThemeColor: (color: MantineColor) => void
}

const ThemeColorContext = createContext<ThemeColorContextValue | null>(null)

export function ThemeColorProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  const [themeColor, setLocalThemeColor] = useLocalStorage<MantineColor>({
    key: 'theme-color',
    defaultValue: 'pink'
  })

  const { data, isSuccess } = usePreferences(isAuthenticated)
  const { mutate: updatePreferences } = useUpdatePreferences()
  const preferences = data?.data

  useEffect(() => {
    if (isSuccess && preferences?.themeColor && preferences.themeColor !== themeColor) {
      setLocalThemeColor(preferences.themeColor)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, preferences?.themeColor])

  function setThemeColor(color: MantineColor) {
    setLocalThemeColor(color)
    if (isAuthenticated) {
      updatePreferences({ themeColor: color })
    }
  }

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  )
}

export function useThemeColor() {
  const ctx = useContext(ThemeColorContext)
  if (!ctx) throw new Error('useThemeColor must be used within a ThemeColorProvider')
  return ctx
}
