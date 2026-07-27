'use client'

import { useDisclosure } from '@mantine/hooks'
import { ActionIcon, Box, Collapse, Group, Stack, Text, ThemeIcon, rem } from '@mantine/core'
import { IconCalendar, IconChevronDown, IconX } from '@tabler/icons-react'
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
  const [opened, { toggle, close }] = useDisclosure(false)

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
    close()
  }

  const isOpen = opened && canEdit

  return (
    <Box
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden'
      }}
    >
      <HoverableBox
        disabled={!canEdit}
        onClick={() => canEdit && toggle()}
        style={{ borderRadius: 0 }}
        active={false}
      >
        <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon variant="light" color="gray" radius="md" size="md">
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

          <Group gap={4} wrap="nowrap">
            {dueDate && canEdit && (
              <ActionIcon variant="subtle" color="gray" radius="xl" onClick={handleClearAll}>
                <IconX style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            )}
            {canEdit && (
              <ActionIcon variant="subtle" color="gray" radius="xl">
                <IconChevronDown
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: isOpen ? 'rotate(180deg)' : undefined,
                    transition: 'transform 150ms ease'
                  }}
                />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </HoverableBox>

      <Collapse expanded={isOpen} transitionDuration={180} transitionTimingFunction="ease">
        <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
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
        </Box>
      </Collapse>
    </Box>
  )
}