import dayjs from 'dayjs'

/**
 * The subset of RFC 5545 RRULE the app edits: FREQ, INTERVAL, BYDAY (weekly), COUNT, UNTIL.
 * Other parts of a rule are kept as they are when it is rebuilt.
 * The series starts at the task's due date (API and calendar both use it as DTSTART), so
 * "every month" means on the due date's day of the month.
 */

export const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const
export type Frequency = (typeof FREQUENCIES)[number]

/** Monday first, as in RRULE examples; dayjs().day() is 0 = Sunday */
export const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const
export type Weekday = (typeof WEEKDAYS)[number]
const DAYJS_WEEKDAY: Record<Weekday, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

export const WORKING_DAYS: Weekday[] = ['MO', 'TU', 'WE', 'TH', 'FR']

export type RecurrenceEnd =
  | { type: 'never' }
  | { type: 'count'; count: number }
  /** Last day of the series, 'YYYY-MM-DD' (inclusive) */
  | { type: 'until'; until: string }

export type Recurrence = {
  freq: Frequency
  interval: number
  /** Days of the week (the editor sets them for weekly rules); empty = from the due date */
  byDay: Weekday[]
  end: RecurrenceEnd
  /** Parts not edited by the app, kept verbatim */
  extra: string[]
}

export function weekdayOf(date: string): Weekday {
  const day = dayjs(date).day()
  return WEEKDAYS.find(weekday => DAYJS_WEEKDAY[weekday] === day)!
}

export function dayjsWeekday(weekday: Weekday) {
  return DAYJS_WEEKDAY[weekday]
}

/** RRULE line only (a rule may also carry DTSTART/EXDATE lines) */
function ruleBody(rule: string) {
  const line = rule
    .trim()
    .split('\n')
    .map(part => part.trim())
    .find(part => part.startsWith('RRULE:'))
  return (line ?? rule.trim()).replace(/^RRULE:/, '')
}

export function parseRecurrence(rule: string | null | undefined): Recurrence | null {
  if (!rule) return null
  const result: Recurrence = { freq: 'DAILY', interval: 1, byDay: [], end: { type: 'never' }, extra: [] }
  let hasFreq = false

  for (const part of ruleBody(rule).split(';').filter(Boolean)) {
    const [key, value = ''] = part.split('=')
    switch (key?.toUpperCase()) {
      case 'FREQ':
        if (!(FREQUENCIES as readonly string[]).includes(value)) return null
        result.freq = value as Frequency
        hasFreq = true
        break
      case 'INTERVAL':
        result.interval = Math.max(1, parseInt(value, 10) || 1)
        break
      case 'BYDAY': {
        const days = value.split(',').map(day => day.toUpperCase())
        // Positional days ("1MO" = first Monday) are not edited by the app: keep them as is
        if (days.some(day => !(WEEKDAYS as readonly string[]).includes(day))) {
          result.extra.push(part)
        } else {
          result.byDay = WEEKDAYS.filter(day => days.includes(day))
        }
        break
      }
      case 'COUNT':
        result.end = { type: 'count', count: Math.max(1, parseInt(value, 10) || 1) }
        break
      case 'UNTIL': {
        const match = /^(\d{4})(\d{2})(\d{2})/.exec(value)
        if (match) result.end = { type: 'until', until: `${match[1]}-${match[2]}-${match[3]}` }
        break
      }
      default:
        result.extra.push(part)
    }
  }

  return hasFreq ? result : null
}

/** Shortest rule for the recurrence: 'FREQ=WEEKLY', not 'FREQ=WEEKLY;INTERVAL=1' */
export function buildRecurrence(recurrence: Recurrence): string {
  const parts = [`FREQ=${recurrence.freq}`]
  if (recurrence.interval > 1) parts.push(`INTERVAL=${recurrence.interval}`)
  if (recurrence.byDay.length > 0) parts.push(`BYDAY=${recurrence.byDay.join(',')}`)
  if (recurrence.end.type === 'count') parts.push(`COUNT=${recurrence.end.count}`)
  if (recurrence.end.type === 'until') {
    // End of that day in UTC: inclusive whatever the task's time and time zone
    parts.push(`UNTIL=${recurrence.end.until.replace(/-/g, '')}T235959Z`)
  }
  return [...parts, ...recurrence.extra].join(';')
}

export function normalizeRule(rule: string | null | undefined) {
  const parsed = parseRecurrence(rule)
  return parsed ? buildRecurrence(parsed) : null
}

export type RecurrencePreset = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly'

export const RECURRENCE_PRESETS: Record<RecurrencePreset, string> = {
  daily: 'FREQ=DAILY',
  weekdays: `FREQ=WEEKLY;BYDAY=${WORKING_DAYS.join(',')}`,
  // These follow the due date: weekday, day of the month, day of the year
  weekly: 'FREQ=WEEKLY',
  monthly: 'FREQ=MONTHLY',
  yearly: 'FREQ=YEARLY'
}

/** The preset a rule is equal to, if any */
export function matchPreset(rule: string | null | undefined): RecurrencePreset | null {
  const normalized = normalizeRule(rule)
  if (!normalized) return null
  const entry = Object.entries(RECURRENCE_PRESETS).find(([, value]) => value === normalized)
  return entry ? (entry[0] as RecurrencePreset) : null
}

export function defaultRecurrence(): Recurrence {
  return { freq: 'WEEKLY', interval: 1, byDay: [], end: { type: 'never' }, extra: [] }
}
