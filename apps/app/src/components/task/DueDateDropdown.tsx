'use client'

import { Stack, Divider, Group, rem, ActionIcon, NumberInput, Select } from '@mantine/core'
import { DatePicker, TimeInput } from '@mantine/dates'
import { IconClock, IconHourglass, IconRepeat } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRecurrenceOptions } from '@/hooks/useOptionLabel'

type DueDateDropdownProps = {
  dueDate: string | null
  dueTime: string | null
  durationMinutes: number | null
  recurrenceRule: string | null
  onDateChange: (date: string | null) => void
  onTimeChange: (time: string | null) => void
  onDurationChange: (minutes: number | null) => void
  onRecurrenceChange: (rrule: string | null) => void
}

export default function DueDateDropdown({
  dueDate,
  dueTime,
  durationMinutes,
  recurrenceRule,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onRecurrenceChange
}: DueDateDropdownProps) {
  const t = useTranslations('DueDateDropdown')
  const recurrenceOptions = useRecurrenceOptions()
  const timeInputRef = useRef<HTMLInputElement>(null)

  const handleDurationChange = (val: string | number) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    onDurationChange(isNaN(num) || num <= 0 ? null : num)
  }

  return (
    <Stack gap="md" style={{ width: '100%' }}>
      <DatePicker
        highlightToday
        allowDeselect
        size="sm"
        value={dueDate ? dayjs(dueDate).toDate() : null}
        onChange={value => {
          if (!value) {
            onDateChange(null)
            onTimeChange(null)
            onDurationChange(null)
            return
          }
          onDateChange(dayjs(value).format('YYYY-MM-DD'))
        }}
      />

      <Divider size="xs" label={t('timeAndDuration')} labelPosition="center" />

      <Group grow gap="xs">
        <TimeInput
          label={t('dueTimeLabel')}
          placeholder={t('dueTimePlaceholder')}
          ref={timeInputRef}
          disabled={!dueDate}
          leftSection={<IconClock style={{ width: rem(16), height: rem(16) }} />}
          value={dueTime ?? ''}
          onChange={e => onTimeChange(e.currentTarget.value || null)}
          rightSection={
            <ActionIcon
              variant="subtle"
              color="gray"
              disabled={!dueDate}
              onClick={() => timeInputRef.current?.showPicker()}
            >
              <IconClock style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          }
        />

        <NumberInput
          label={t('durationLabel')}
          placeholder={t('durationPlaceholder')}
          disabled={!dueTime}
          min={1}
          value={durationMinutes ?? ''}
          onChange={handleDurationChange}
          leftSection={<IconHourglass style={{ width: rem(16), height: rem(16) }} />}
          suffix={t('durationSuffix')}
        />
      </Group>

      <Divider size="xs" label={t('recurrence')} labelPosition="center" />

      <Select
        placeholder={t('recurrencePlaceholder')}
        disabled={!dueDate}
        leftSection={<IconRepeat style={{ width: rem(16), height: rem(16) }} />}
        data={recurrenceOptions}
        value={recurrenceRule || 'NONE'}
        onChange={val => {
          onRecurrenceChange(val === 'NONE' ? null : val)
        }}
        comboboxProps={{
          zIndex: 1000
        }}
      />
    </Stack>
  )
}