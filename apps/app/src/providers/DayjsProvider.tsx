'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import dayjs from 'dayjs'

import 'dayjs/locale/en'
import 'dayjs/locale/it'

export function DayjsProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()

  useEffect(() => {
    // Sync Dayjs with current next-intl locale
    dayjs.locale(locale)
  }, [locale])

  return <>{children}</>
}