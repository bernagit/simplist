'use client'

import { ActionIcon, Group, Popover, Stack, Text, ThemeIcon, rem } from '@mantine/core'
import { IconCalendar, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import HoverableBox from './HoverableBox'
import { RECURRENCE_PRESETS } from '@/utils/constants'
import DueDateDropdown from './DueDateDropdown'

type TaskDueDateFieldProps = {
  dueDate: string | null
  dueTime: string | null
  durationMinutes: number | null
  recurrenceRule: string | null
  canEdit?: boolean
  onDateChange: (date: string | null) => void
  onTimeChange: (time: string | null) => void
  onDurationChange: (minutes: number | null) => void
  onRecurrenceChange: (rrule: string | null) => void
}

export default function TaskDueDateField({
  dueDate,
  dueTime,
  durationMinutes,
  recurrenceRule,
  canEdit = true,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onRecurrenceChange
}: TaskDueDateFieldProps) {
  const displaySummary = (() => {
    if (!dueDate) return 'Set due date'

    const dateStr = dayjs(dueDate).format('MMM D, YYYY')
    const timeStr = dueTime ? ` at ${dueTime}` : ''
    const durationStr = durationMinutes ? ` (${durationMinutes}m)` : ''

    let recurStr = ''
    if (recurrenceRule) {
      const preset = RECURRENCE_PRESETS.find(p => p.value === recurrenceRule)
      recurStr = preset ? ` • ${preset.label}` : ' • Recurring'
    }

    return `${dateStr}${timeStr}${durationStr}${recurStr}`
  })()

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(null)
    onTimeChange(null)
    onDurationChange(null)
    onRecurrenceChange(null)
  }

  return (
    <Popover
      disabled={!canEdit}
      position="bottom-start"
      shadow="lg"
      radius="md"
      withArrow
      offset={8}
      zIndex={500}
    >
      <Popover.Target>
        <HoverableBox disabled={!canEdit}>
          <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" color={'gray'} radius="md" size="md">
                <IconCalendar style={{ width: rem(18), height: rem(18) }} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text size="xs" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
                  Due Date
                </Text>
                <Text size="sm" fw={dueDate ? 600 : 400} c={dueDate ? 'dark.4' : 'dimmed'}>
                  {displaySummary}
                </Text>
              </Stack>
            </Group>

            {dueDate && canEdit && (
              <ActionIcon variant="subtle" color="gray" radius="xl" onClick={handleClearAll}>
                <IconX style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            )}
          </Group>
        </HoverableBox>
      </Popover.Target>

      <Popover.Dropdown p="md">
        <DueDateDropdown
          dueDate={dueDate}
          dueTime={dueTime}
          durationMinutes={durationMinutes}
          recurrenceRule={recurrenceRule}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
          onDurationChange={onDurationChange}
          onRecurrenceChange={onRecurrenceChange}
        />
      </Popover.Dropdown>
    </Popover>
  )
}
