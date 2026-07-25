export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: 'red' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'low', label: 'Low', color: 'blue' },
  { value: null, label: 'None', color: 'dimmed' }
] as const

export const RECURRENCE_PRESETS = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'FREQ=DAILY', label: 'Daily' },
  { value: 'FREQ=WEEKLY', label: 'Weekly' },
  { value: 'FREQ=MONTHLY', label: 'Monthly' }
]

export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds
