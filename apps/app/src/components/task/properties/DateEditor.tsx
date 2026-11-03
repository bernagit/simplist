'use client'

import { Button, Divider, Group, Select, Stack } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { ClearableTimeInput } from '@/components/common/ClearableTimeInput'
import { IconClock, IconHourglass } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { TaskProperties } from '@/models/task'
import { useDurationLabel } from '@/hooks/useOptionLabel'

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240]
const DAYS_PER_WEEK = 7
const MONDAY = 1

type DateEditorProps = {
  value: Pick<TaskProperties, 'dueDate' | 'dueTime' | 'durationMinutes'>
  onChange: (patch: Partial<TaskProperties>) => void
  /** Closes the picker (quick picks, Done; outside tap, Escape and back also close it) */
  onDone: () => void
}

const toDateString = (date: dayjs.Dayjs) => date.format('YYYY-MM-DD')

export function DateEditor({ value, onChange, onDone }: DateEditorProps) {
  const t = useTranslations('TaskProperties.date')
  const durationLabel = useDurationLabel()
  const today = dayjs()

  const quickPicks = [
    { key: 'today', date: today },
    { key: 'tomorrow', date: today.add(1, 'day') },
    // Next Monday, also when today is Monday
    { key: 'nextWeek', date: today.add(((MONDAY - today.day() + DAYS_PER_WEEK) % DAYS_PER_WEEK) || DAYS_PER_WEEK, 'day') }
  ] as const

  const durationOptions = useMemo(() => {
    const values = new Set(DURATIONS)
    if (value.durationMinutes) values.add(value.durationMinutes)
    return [...values]
      .sort((a, b) => a - b)
      .map(minutes => ({ value: String(minutes), label: durationLabel(minutes) }))
  }, [value.durationMinutes, durationLabel])

  return (
    <Stack gap="sm">
      <Group gap={6} wrap="wrap">
        {quickPicks.map(pick => {
          const date = toDateString(pick.date)
          return (
            <Button
              key={pick.key}
              size="compact-sm"
              radius="xl"
              variant={value.dueDate === date ? 'filled' : 'light'}
              onClick={() => {
                onChange({ dueDate: date })
                onDone()
              }}
            >
              {t(pick.key)}
            </Button>
          )
        })}
      </Group>

      <Group justify="center">
        <DatePicker
          highlightToday
          size="sm"
          value={value.dueDate}
          onChange={date => date && onChange({ dueDate: dayjs(date).format('YYYY-MM-DD') })}
        />
      </Group>

      <Divider />

      <Group grow gap="xs" align="flex-end">
        <ClearableTimeInput
          label={t('time')}
          leftSection={<IconClock size={16} />}
          disabled={!value.dueDate}
          value={value.dueTime}
          onChange={time =>
            onChange(time ? { dueTime: time } : { dueTime: null, durationMinutes: null })
          }
        />
        <Select
          label={t('duration')}
          placeholder={t('noDuration')}
          leftSection={<IconHourglass size={16} />}
          disabled={!value.dueTime}
          clearable
          data={durationOptions}
          value={value.durationMinutes ? String(value.durationMinutes) : null}
          onChange={minutes => onChange({ durationMinutes: minutes ? Number(minutes) : null })}
          comboboxProps={{ withinPortal: false }}
        />
      </Group>

      <Button fullWidth variant="light" radius="md" onClick={onDone}>
        {t('done')}
      </Button>
    </Stack>
  )
}
