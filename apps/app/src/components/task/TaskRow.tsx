'use client'

import { Task } from '@/models/task'
import { ActionIcon, Checkbox, Group, Stack, Text } from '@mantine/core'
import { IconCalendar, IconDots, IconGripVertical } from '@tabler/icons-react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { getPriorityColor } from '@/utils/color'
import { useSidebar } from '@/providers/SidebarProvider'

type TaskRowProps = {
  task: Task
  onToggle?: (task: Task) => void | Promise<void>
  onClick?: (task: Task) => void | Promise<void>
}

export default function TaskRow({ task, onToggle, onClick }: TaskRowProps) {
  const { isMobile } = useSidebar()
  const [hovered, setHovered] = useState(false)
  const colorMemo = useMemo(() => getPriorityColor(task.priority), [task.priority])

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id
  })

  return (
    <Group
      ref={setNodeRef}
      wrap="nowrap"
      justify="space-between"
      align="center"
      px="xs"
      py={8}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 6,
        cursor: 'default',
        // transition: transition ?? 'background-color 120ms ease',
        transform: CSS.Transform.toString(transform),
        // backgroundColor: isDragging
        //   ? colorScheme === 'dark'
        //     ? 'var(--mantine-color-dark-5)'
        //     : 'var(--mantine-color-gray-1)'
        //   : hovered
        //     ? colorScheme === 'dark'
        //       ? 'var(--mantine-color-dark-6)'
        //       : 'var(--mantine-color-gray-0)'
        //     : 'transparent',

        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,.18)' : undefined,

        opacity: isDragging ? 0.95 : 1,
        zIndex: isDragging ? 100 : 1
      }}
    >
      <Group wrap="nowrap" gap="sm" flex={1} align="flex-start">
        <ActionIcon
          {...attributes}
          {...listeners}
          variant="transparent"
          color="gray"
          size="sm"
          style={{
            opacity: isMobile || hovered ? 1 : 0,
            cursor: 'grab',
            transition: 'opacity 120ms',
            marginTop: 2
          }}
          mt={task.description ? 10 : 0}
        >
          <IconGripVertical size={14} />
        </ActionIcon>
        <Group
          style={{ flex: 1, minWidth: 0 }}
          onClick={e => {
            // filter out clicks on the checkbox and the action icon
            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return
            if ((e.target as HTMLElement).closest('button')) return
            console.log('task click', task)
            onClick?.(task)
          }}
        >
          <Checkbox
            radius="xl"
            checked={task.completed}
            onChange={() => {
              console.log('task toggle', task)
              onToggle?.(task)
            }}
            color={colorMemo}
            styles={{
              root: {
                opacity: task.completed ? 0.6 : 1,
                transition: 'opacity 150ms ease'
              },
              input: {
                borderColor: colorMemo,
                backgroundColor: task.completed ? colorMemo : undefined
              }
            }}
          />

          <Stack gap={2} flex={1}>
            <Text
              size="sm"
              fw={500}
              td={task.completed ? 'line-through' : undefined}
              c={task.completed ? 'dimmed' : 'inherit'}
              mt={task.description ? 4 : 0}
            >
              {task.title}
            </Text>

            {task.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {task.description}
              </Text>
            )}
          </Stack>
        </Group>
      </Group>

      <Group gap="xs" wrap="nowrap">
        {task.dueDate && (
          <Group gap={4} wrap="nowrap">
            <IconCalendar size={14} />

            <Text size="xs" c="dimmed">
              {dayjs(task.dueDate).format('D MMM')}
            </Text>
          </Group>
        )}

        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          style={{
            opacity: isMobile || hovered ? 1 : 0,
            transition: 'opacity 120ms'
          }}
        >
          <IconDots size={16} />
        </ActionIcon>
      </Group>
    </Group>
  )
}
