import { formatDate } from '@/utils/date'
import { Button, Group, Popover, Text } from '@mantine/core'
import { IconCalendar, IconX } from '@tabler/icons-react'
import DueDateDropdown from './DueDateDropdown'

type DateSelectorProps = {
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

export default function DateSelector({
  dueDate,
  dueTime,
  durationMinutes,
  recurrenceRule,
  canEdit,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onRecurrenceChange
}: DateSelectorProps) {
  const shortDate = formatDate(dueDate)

  return (
    <Group gap={0}>
      <Popover position="bottom-start" shadow="md">
        <Popover.Target>
          <Button
            variant="outline"
            color="gray"
            mt="xs"
            h={30}
            px={4}
            radius={4}
            style={{
              fontSize: 13,
              fontWeight: 500,
              width: 'fit-content',
              borderRadius: dueDate ? '4px 0px 0px 4px' : 4
            }}
          >
            <IconCalendar size={16} style={{ marginRight: 4 }} />
            <Text mt={4} size={'13px'} fw={500}>
              {shortDate ? shortDate : 'Date'}
            </Text>
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
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
      {dueDate && (
        <Button
          variant="outline"
          color="gray"
          mt="xs"
          h={30}
          px={4}
          radius={4}
          style={{
            borderRadius: '0px 4px 4px 0px',
            borderLeft: 0,
            fontSize: 13,
            fontWeight: 500,
            width: 'fit-content'
          }}
          onClick={() => onDateChange(null)}
        >
          <IconX size={16} />
        </Button>
      )}
    </Group>
  )
}
