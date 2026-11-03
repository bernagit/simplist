import { useCallback } from 'react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

/** "Updated today", "Updated yesterday", "Updated 3 Nov", "Updated 3 Nov 2025" */
export function useUpdatedLabel() {
  const t = useTranslations('ListsOverview.updated')
  return useCallback(
    (value: Date | string) => {
      const date = dayjs(value)
      const days = dayjs().startOf('day').diff(date.startOf('day'), 'day')
      if (days <= 0) return t('today')
      if (days === 1) return t('yesterday')
      return t('on', {
        date: date.format(date.year() === dayjs().year() ? 'D MMM' : 'D MMM YYYY')
      })
    },
    [t]
  )
}
