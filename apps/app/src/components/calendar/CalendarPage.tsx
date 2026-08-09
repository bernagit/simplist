'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/it' // Import required dayjs locales
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  UnstyledButton,
  useMantineTheme,
  Text
} from '@mantine/core'
import {
  AgendaView,
  DateStringValue,
  getStartOfWeek,
  Schedule,
  ScheduleEventData,
  ScheduleHeader,
  ScheduleViewLevel
} from '@mantine/schedule'
import { usePlannedTasks } from '@/queries/task'
import { useSidebar } from '@/providers/SidebarProvider'
import { editTaskModal } from '@/lib/modals/task'
import { getHTMLSectionId } from '@/utils/misc'
import { useRouter } from 'next/navigation'
import { PlannedTask } from '@/models/task'
import { IconReload } from '@tabler/icons-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePriorityOptions } from '@/hooks/useOptionLabel'

function getNavigationHandlers(date: DateStringValue, view: Exclude<ScheduleViewLevel, 'year'>) {
  const d = dayjs(date)

  switch (view) {
    case 'day':
      return {
        previous: d.subtract(1, 'day'),
        next: d.add(1, 'day')
      }

    case 'week':
      return {
        previous: d.subtract(1, 'week'),
        next: d.add(1, 'week')
      }

    case 'month':
      return {
        previous: d.subtract(1, 'month').startOf('month'),
        next: d.add(1, 'month').startOf('month')
      }
  }
}

function getHeaderLabel(date: DateStringValue, view: Exclude<ScheduleViewLevel, 'year'>) {
  const d = dayjs(date)
  switch (view) {
    case 'day':
      return d.format('dddd, MMMM D, YYYY')

    case 'week': {
      const start = dayjs(
        getStartOfWeek({
          date,
          firstDayOfWeek: 1
        })
      )

      const end = start.add(6, 'day')

      if (start.month() === end.month()) {
        return `${start.format('MMM D')} – ${end.format('D, YYYY')}`
      }

      return `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`
    }

    case 'month':
      return d.format('MMMM YYYY')
  }
}

export default function CustomSchedule() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('CustomSchedule')
  const priorityOptions = usePriorityOptions()

  // Ensure dayjs uses the active app locale for date formatting
  useEffect(() => {
    dayjs.locale(locale)
  }, [locale])

  const [date, setDate] = useState<DateStringValue>(dayjs().format('YYYY-MM-DD') as DateStringValue)
  const { isMobile } = useSidebar()
  const [view, setView] = useState<Exclude<ScheduleViewLevel, 'year'>>('week')
  const theme = useMantineTheme()
  const [withAgenda, setWithAgenda] = useState(false)
  const [updatedTasks, setUpdatedTasks] = useState<Record<string, PlannedTask>>({})

  const nav = getNavigationHandlers(date, view)

  const visibleRange = useMemo(() => {
    const d = dayjs(date)

    switch (view) {
      case 'day':
        return {
          start: d.startOf('day'),
          end: d.endOf('day')
        }

      case 'week': {
        const start = dayjs(
          getStartOfWeek({
            date,
            firstDayOfWeek: 1
          })
        )
        return {
          start,
          end: start.add(6, 'day').endOf('day')
        }
      }

      case 'month':
        return {
          start: d.startOf('month'),
          end: d.endOf('month')
        }
    }
  }, [date, view])

  const {
    data: plannedTasks,
    isLoading,
    refetch
  } = usePlannedTasks(visibleRange.start.toDate(), visibleRange.end.toDate())

  const tasks = useMemo(() => {
    if (!plannedTasks?.data) return []

    return plannedTasks.data.map(task => updatedTasks[task.id] ?? task)
  }, [plannedTasks, updatedTasks])

  const events = useMemo(() => {
    if (!tasks) return []

    return tasks
      .filter(task => task.dueDate)
      .map(task => {
        let start: string
        let end: string

        if (task.dueTime) {
          const startDate = dayjs(`${task.dueDate} ${task.dueTime}`)
          // If duration is not specified, default to 30 minutes
          const endDate = startDate.add(task.durationMinutes ?? 30, 'minute')

          start = startDate.format('YYYY-MM-DD HH:mm:ss')
          end = endDate.format('YYYY-MM-DD HH:mm:ss')
        } else {
          // All-day event
          start = dayjs(task.dueDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')

          end = dayjs(task.dueDate).add(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        }

        return {
          id: task.id,
          title: task.title,
          start,
          end,
          color: task.color,
          data: task,
          ...(task.recurrenceRule ? { recurrence: { rrule: task.recurrenceRule } } : {})
        }
      })
  }, [tasks])

  const handleEventClick = useCallback(
    (event: ScheduleEventData) => {
      const task = events.find(e => e.id === event.id)?.data
      if (!task) return
      const navigation = {
        onOpenList: () => {
          router.push(`/lists/${task.listId}`)
        },
        onOpenSection: () => {
          let sectionUrl = `/lists/${task.listId}`
          if (task.sectionId) {
            sectionUrl += `#${getHTMLSectionId(task.sectionId)}`
          }
          router.push(sectionUrl)
        }
      }
      editTaskModal(task, isMobile, true, navigation, (updatedTask: PlannedTask) => {
        setUpdatedTasks(prev => ({
          ...prev,
          [updatedTask.id]: updatedTask
        }))
      })
    },
    [events, isMobile, router]
  )

  useEffect(() => {
    refetch()
  }, [refetch])

  if (isLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0
        }}
      >
        <ScheduleHeader mb="md">
          <ScheduleHeader.Previous />
          <ScheduleHeader.Control interactive={false} miw={220}>
            {t('loading')}
          </ScheduleHeader.Control>
          <ScheduleHeader.Next />
          <ScheduleHeader.Today />
        </ScheduleHeader>

        <Center style={{ flex: 1, minHeight: 0 }}>
          <Loader size="xl" />
        </Center>
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}
    >
      <ScheduleHeader mb="md">
        <ScheduleHeader.Previous
          onClick={() => setDate(nav.previous.format('YYYY-MM-DD') as DateStringValue)}
        />

        <ScheduleHeader.Control interactive={false} miw={220}>
          {getHeaderLabel(date, view)}
        </ScheduleHeader.Control>

        <ScheduleHeader.Next
          onClick={() => setDate(nav.next.format('YYYY-MM-DD') as DateStringValue)}
        />

        <ScheduleHeader.Today
          onClick={() => setDate(dayjs().format('YYYY-MM-DD') as DateStringValue)}
        />
        <Button
          size="compact-md"
          variant={withAgenda ? 'filled' : 'outline'}
          onClick={() => setWithAgenda(prev => !prev)}
        >
          {t('agenda')}
        </Button>

        <Group ms="auto">
          <SegmentedControl
            value={view}
            onChange={value => setView(value as Exclude<ScheduleViewLevel, 'year'>)}
            data={[
              { value: 'day', label: t('views.day') },
              { value: 'week', label: t('views.week') },
              { value: 'month', label: t('views.month') }
            ]}
            color={theme.primaryColor}
          />
        </Group>
      </ScheduleHeader>
      {withAgenda ? (
        <AgendaView
          rangeStart={visibleRange.start}
          rangeEnd={visibleRange.end}
          style={{ flex: 1, minHeight: 0 }}
          events={events}
          renderEvent={(event, props) => {
            const task = event as unknown as { data: PlannedTask }
            const isAllDay = !task.data.dueTime
            const priorityObj = priorityOptions.find(p => p.value === task.data.priority)

            return (
              <UnstyledButton {...props}>
                <Box
                  style={{
                    display: 'flex',
                    gap: 'var(--mantine-spacing-sm)',
                    padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)',
                    opacity: task.data.completed ? 0.55 : 1
                  }}
                >
                  <Box
                    style={{
                      width: 4,
                      borderRadius: 2,
                      flexShrink: 0,
                      backgroundColor: task.data.color
                    }}
                  />

                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <Text
                        size="sm"
                        fw={500}
                        td={task.data.completed ? 'line-through' : undefined}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.data.title}
                      </Text>

                      <Group gap={4} wrap="nowrap">
                        {task.data.recurrenceRule && (
                          <Badge size="xs" variant="light" color="gray">
                            <IconReload size={12} />
                          </Badge>
                        )}
                        {priorityObj && (
                          <Badge
                            size="xs"
                            variant="light"
                            color={priorityObj.color ?? 'gray'}
                          >
                            {priorityObj.label}
                          </Badge>
                        )}
                      </Group>
                    </Group>

                    <Text size="xs" c="dimmed">
                      {isAllDay
                        ? t('allDay')
                        : `${dayjs(event.start).format('HH:mm')} – ${dayjs(event.end).format('HH:mm')}`}
                    </Text>

                    <Text
                      size="xs"
                      c="dimmed"
                      mt={2}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {task.data.listTitle}
                      {task.data.sectionTitle ? ` › ${task.data.sectionTitle}` : ''}
                    </Text>
                  </Stack>
                </Box>
              </UnstyledButton>
            )
          }}
          onEventClick={handleEventClick}
        />
      ) : (
        <Schedule
          style={{ flex: 1, minHeight: 0 }}
          date={date}
          onDateChange={setDate}
          view={view}
          onViewChange={value => setView(value as Exclude<ScheduleViewLevel, 'year'>)}
          events={events}
          onEventClick={handleEventClick}
          withAgenda={true}
          dayViewProps={{
            withHeader: false,
            intervalMinutes: 30,
            scrollAreaProps: { mah: '100%' }
          }}
          weekViewProps={{
            withHeader: false,
            scrollAreaProps: { mah: '100%' }
          }}
          monthViewProps={{
            withHeader: false,
            scrollAreaProps: { mah: '100%' }
          }}
          yearViewProps={{
            withHeader: false
          }}
        />
      )}
    </Box>
  )
}