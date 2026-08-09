export const PRIORITY_CONFIG = [
  { value: 'high', labelKey: 'high', color: 'red' },
  { value: 'medium', labelKey: 'medium', color: 'yellow' },
  { value: 'low', labelKey: 'low', color: 'blue' },
  { value: null, labelKey: 'none', color: 'dimmed' }
] as const

export const RECURRENCE_CONFIG = [
  { value: 'NONE', labelKey: 'none' },
  { value: 'FREQ=DAILY', labelKey: 'daily' },
  { value: 'FREQ=WEEKLY', labelKey: 'weekly' },
  { value: 'FREQ=MONTHLY', labelKey: 'monthly' }
] as const

export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds