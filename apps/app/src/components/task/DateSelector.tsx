'use client'

import { formatDate } from '@/utils/date'
import { Button, Drawer, Group, Popover, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconCalendar, IconX } from '@tabler/icons-react'
import DueDateDropdown from './DueDateDropdown'
import { useSidebar } from '@/providers/SidebarProvider'
import { useTranslations } from 'next-intl'
import { useCloseOnBack } from '@/hooks/useCloseOnBack'

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
  canEdit = true,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onRecurrenceChange
}: DateSelectorProps) {
  const t = useTranslations('DueDateDropdown')
  const shortDate = formatDate(dueDate)
  const { isMobile, isTouch } = useSidebar()
  const chipHeight = isTouch ? 36 : 30
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
  useCloseOnBack(drawerOpened, closeDrawer)

  const dropdownContent = (
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
  )

  const dateButtonStyle = {
    fontSize: 13,
    fontWeight: 500,
    width: 'fit-content',
    borderRadius: dueDate ? '4px 0px 0px 4px' : 4
  } as const

  return (
    <Group gap={0}>
      {isMobile ? (
        <>
          <Button
            variant="outline"
            color="gray"
            mt="xs"
            h={chipHeight}
            px={4}
            radius={4}
            disabled={!canEdit}
            onClick={() => {
              openDrawer()
            }}
            style={dateButtonStyle}
          >
            <IconCalendar size={16} style={{ marginRight: 4 }} />
            <Text mt={4} size={'13px'} fw={500}>
              {shortDate ? shortDate : t('label')}
            </Text>
          </Button>

          <Drawer
            opened={drawerOpened}
            onClose={closeDrawer}
            position="bottom"
            radius="md"
            size="auto"
            title={t('drawerTitle')}
            padding="md"
          >
            {dropdownContent}
          </Drawer>
        </>
      ) : (
        <Popover position="bottom-start" shadow="md" withinPortal disabled={!canEdit}>
          <Popover.Target>
            <Button
              variant="outline"
              color="gray"
              mt="xs"
              h={chipHeight}
              px={4}
              radius={4}
              style={dateButtonStyle}
            >
              <IconCalendar size={16} style={{ marginRight: 4 }} />
              <Text mt={4} size={'13px'} fw={500}>
                {shortDate ? shortDate : t('label')}
              </Text>
            </Button>
          </Popover.Target>
          <Popover.Dropdown p="md" style={{ width: 280 }}>
            {dropdownContent}
          </Popover.Dropdown>
        </Popover>
      )}

      {dueDate && (
        <Button
          variant="outline"
          color="gray"
          mt="xs"
          h={chipHeight}
          px={4}
          radius={4}
          disabled={!canEdit}
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