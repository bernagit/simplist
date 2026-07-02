import { Button, Group, Popover, Text } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { IconCalendar, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'

type DateSelectorProps = {
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
}

const formatDate = (date: string | null) => {
  if (!date) return null
  return dayjs(date).format('D MMM')
}

export default function DateSelector({ selectedDate, setSelectedDate }: DateSelectorProps) {
  const shortDate = formatDate(selectedDate)

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
              borderRadius: selectedDate ? '4px 0px 0px 4px' : 4
            }}
          >
            <IconCalendar size={16} style={{ marginRight: 4 }} />
            <Text mt={4} size={'13px'} fw={500}>
              {shortDate ? shortDate : 'Date'}
            </Text>
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <DatePicker highlightToday allowDeselect onChange={date => setSelectedDate(date)} />
        </Popover.Dropdown>
      </Popover>
      {selectedDate && (
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
          onClick={() => setSelectedDate(null)}
        >
          <IconX size={16} />
        </Button>
      )}
    </Group>
  )
}
