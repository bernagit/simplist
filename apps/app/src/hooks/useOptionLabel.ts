import { useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { PRIORITY_CONFIG } from '@/utils/constants'
import { LEAD_MINUTES } from '@/models/notification'
import { TaskProperties } from '@/models/task'
import { dayjsWeekday, matchPreset, parseRecurrence, WEEKDAYS } from '@/lib/recurrence'

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 1440
/** Within this many days, a date reads as its weekday ("Friday") */
const WEEKDAY_NAME_RANGE = 6

export function usePriorityOptions() {
  const t = useTranslations('Constants.Priority')

  return PRIORITY_CONFIG.map(item => ({
    ...item,
    label: t(item.labelKey)
  }))
}

/** "15 minutes before", "1 hour before", "At the time of the task" */
export function useLeadTimeLabel() {
  const t = useTranslations('TaskLabels.lead')
  return useCallback(
    (minutes: number) =>
      minutes === 0
        ? t('atTime')
        : minutes >= MINUTES_PER_DAY && minutes % MINUTES_PER_DAY === 0
          ? t('days', { count: minutes / MINUTES_PER_DAY })
          : minutes >= MINUTES_PER_HOUR && minutes % MINUTES_PER_HOUR === 0
            ? t('hours', { count: minutes / MINUTES_PER_HOUR })
            : t('minutes', { count: minutes }),
    [t]
  )
}

export function useLeadTimeOptions() {
  const label = useLeadTimeLabel()
  return useMemo(
    () => LEAD_MINUTES.map(minutes => ({ value: String(minutes), label: label(minutes) })),
    [label]
  )
}

/** "Today", "Tomorrow", "Friday", "3 Nov", "3 Nov 2027" */
export function useDueDateLabel() {
  const t = useTranslations('TaskLabels.date')
  return useCallback(
    (dueDate: string | null, dueTime?: string | null) => {
      if (!dueDate) return t('none')
      const date = dayjs(dueDate)
      const days = date.startOf('day').diff(dayjs().startOf('day'), 'day')
      const day =
        days === 0
          ? t('today')
          : days === 1
            ? t('tomorrow')
            : days === -1
              ? t('yesterday')
              : days > 1 && days <= WEEKDAY_NAME_RANGE
                ? date.format('dddd')
                : date.year() === dayjs().year()
                  ? date.format('D MMM')
                  : date.format('D MMM YYYY')
      return dueTime ? `${day} · ${dueTime.slice(0, 'HH:MM'.length)}` : day
    },
    [t]
  )
}

/** Past its due date (or due time, for timed tasks) */
export function isOverdue(dueDate: string | null, dueTime: string | null) {
  if (!dueDate) return false
  if (!dueTime) return dayjs(dueDate).isBefore(dayjs(), 'day')
  return dayjs(`${dueDate}T${dueTime}`).isBefore(dayjs())
}

/** "45 min", "1 h 30 min" */
export function useDurationLabel() {
  const t = useTranslations('TaskLabels.duration')
  return useCallback(
    (minutes: number) => {
      const hours = Math.floor(minutes / MINUTES_PER_HOUR)
      const rest = minutes % MINUTES_PER_HOUR
      if (hours === 0) return t('minutes', { count: rest })
      return rest === 0 ? t('hours', { count: hours }) : t('hoursMinutes', { hours, minutes: rest })
    },
    [t]
  )
}

/** Short weekday names in the app locale, Monday first: { MO: 'Mon', ... } */
export function useWeekdayNames() {
  return useMemo(
    () =>
      Object.fromEntries(
        WEEKDAYS.map(weekday => [weekday, dayjs().day(dayjsWeekday(weekday)).format('ddd')])
      ) as Record<(typeof WEEKDAYS)[number], string>,
    []
  )
}

/** "Every 2 weeks on Mon, Wed · 5 times", in words, from an RRULE */
export function useRecurrenceLabel() {
  const t = useTranslations('TaskLabels.recurrence')
  const weekdayNames = useWeekdayNames()

  return useCallback(
    (rule: string | null, dueDate: string | null) => {
      const recurrence = parseRecurrence(rule)
      if (!recurrence) return rule ? t('custom') : t('none')

      const due = dueDate ? dayjs(dueDate) : null
      const count = recurrence.interval
      let text: string
      if (matchPreset(rule) === 'weekdays') {
        text = t('weekdays')
      } else {
        switch (recurrence.freq) {
          case 'DAILY':
            text = t('everyDays', { count })
            break
          case 'WEEKLY': {
            const days =
              recurrence.byDay.length > 0
                ? recurrence.byDay.map(day => weekdayNames[day]).join(', ')
                : due?.format('dddd')
            text = days ? t('everyWeeksOn', { count, days }) : t('everyWeeks', { count })
            break
          }
          case 'MONTHLY':
            text = due
              ? t('everyMonthsOn', { count, day: due.date() })
              : t('everyMonths', { count })
            break
          case 'YEARLY':
            text = due
              ? t('everyYearsOn', { count, date: due.format('D MMMM') })
              : t('everyYears', { count })
            break
        }
      }

      if (recurrence.end.type === 'count') text += ` · ${t('times', { count: recurrence.end.count })}`
      if (recurrence.end.type === 'until') {
        text += ` · ${t('until', { date: dayjs(recurrence.end.until).format('D MMM YYYY') })}`
      }
      return text
    },
    [t, weekdayNames]
  )
}

export type ReminderDefaults = { allDayTime: string; leadMinutes: number } | undefined

/** "15 minutes before", "At 09:00", "No reminder"; defaults come from notification settings */
export function useReminderLabel() {
  const t = useTranslations('TaskLabels.reminder')
  const leadLabel = useLeadTimeLabel()

  return useCallback(
    (task: TaskProperties, defaults: ReminderDefaults) => {
      if (!task.reminderEnabled || !task.dueDate) return t('none')
      if (task.dueTime) {
        const minutes = task.reminderLeadMinutes ?? defaults?.leadMinutes
        return minutes === undefined ? t('on') : leadLabel(minutes)
      }
      const time = (task.reminderTime ?? defaults?.allDayTime)?.slice(0, 'HH:MM'.length)
      return time ? t('atTime', { time }) : t('on')
    },
    [t, leadLabel]
  )
}
