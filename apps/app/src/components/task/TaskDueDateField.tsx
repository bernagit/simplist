'use client'

import { Button, Group, Popover, Text } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { IconCalendar, IconX } from '@tabler/icons-react'
import { formatDate } from '@/utils/date'
import HoverableBox from './HoverableBox'

type TaskDueDateFieldProps = {
  date: string | null
  canEdit?: boolean
  onChange: (date: string | null) => void
}

export default function TaskDueDateField({ date, canEdit, onChange }: TaskDueDateFieldProps) {
  const shortDate = formatDate(date)

  return (
    <Popover disabled={!canEdit} position="bottom-start" shadow="md" zIndex={500}>
      <Popover.Target>
        <HoverableBox disabled={!canEdit}>
          <Group flex={1} justify="space-between">
            <Group align="flex-start" style={{ height: 'var(--button-height-xs)' }}>
              <IconCalendar size={20} />
              <Text size="sm" c="dimmed">
                {shortDate ?? 'No due date'}
              </Text>
            </Group>

            {date && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                m={0}
                p={0}
                onClick={e => {
                  if (!canEdit) return
                  e.stopPropagation()
                  onChange(null)
                }}
              >
                <IconX size={16} />
              </Button>
            )}
          </Group>
        </HoverableBox>
      </Popover.Target>

      <Popover.Dropdown>
        <DatePicker highlightToday allowDeselect onChange={onChange} />
      </Popover.Dropdown>
    </Popover>
  )
}