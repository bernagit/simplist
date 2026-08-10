import { useTranslations } from 'next-intl'
import { PRIORITY_CONFIG, RECURRENCE_CONFIG } from '@/utils/constants'

export function usePriorityOptions() {
  const t = useTranslations('Constants.Priority')

  return PRIORITY_CONFIG.map(item => ({
    ...item,
    label: t(item.labelKey)
  }))
}

export function useRecurrenceOptions() {
  const t = useTranslations('Constants.Recurrence')

  return RECURRENCE_CONFIG.map(item => ({
    value: item.value,
    label: t(item.labelKey)
  }))
}