'use client'

import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Center, Group, Loader, SegmentedControl, useMantineTheme } from '@mantine/core'
import {
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
  const [date, setDate] = useState<DateStringValue>(dayjs().format('YYYY-MM-DD') as DateStringValue)
  const { isMobile } = useSidebar()
  const [view, setView] = useState<Exclude<ScheduleViewLevel, 'year'>>('week')
  const theme = useMantineTheme()
  const [mounted, setMounted] = useState(false)

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


  const { data: plannedTasks, isLoading, refetch } = usePlannedTasks(
    visibleRange.start.toDate(),
    visibleRange.end.toDate()
  )

  const events = useMemo(() => {
    if (!plannedTasks?.data) return []

    return plannedTasks.data
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: task.dueDate!,
        end: dayjs(task.dueDate!).add(30, 'minute').toDate(),
        color: task.color,
        data: task,
      }))
  }, [plannedTasks])

  const handleEventClick = useCallback((event: ScheduleEventData) => {
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
    editTaskModal(task, isMobile, true, navigation)
  }, [events, isMobile, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
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
            Loading...
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

        <Group ms="auto">
          <SegmentedControl
            value={view}
            onChange={value => setView(value as Exclude<ScheduleViewLevel, 'year'>)}
            data={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' }
            ]}
            color={theme.primaryColor}
          />
        </Group>
      </ScheduleHeader>

      <Schedule
        style={{ flex: 1, minHeight: 0 }}
        date={date}
        onDateChange={setDate}
        view={view}
        onViewChange={value => setView(value as Exclude<ScheduleViewLevel, 'year'>)}
        events={events}
        onEventClick={handleEventClick}
        dayViewProps={{
          withHeader: false,
          // startTime: '08:00:00',
          // endTime: '24:00:00',
          intervalMinutes: 30,
          scrollAreaProps: { mah: '100%' },
          withCurrentTimeIndicator: mounted
        }}
        weekViewProps={{
          withHeader: false,
          scrollAreaProps: { mah: '100%' },
          withCurrentTimeIndicator: mounted
        }}
        monthViewProps={{
          withHeader: false,
          scrollAreaProps: { mah: '100%' }
        }}
        yearViewProps={{
          withHeader: false
          // scrollAreaProps: { mah: '100%' },
        }}
      />
    </Box>
  )
}
