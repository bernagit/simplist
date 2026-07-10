'use client'

import { Task } from '@/models/task'
import { ActionIcon, Checkbox, Group, Stack, Text } from '@mantine/core'
import { IconCalendar, IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { getPriorityColor } from '@/utils/color'
import { useSidebar } from '@/providers/SidebarProvider'
import { useDeleteTask, useToggleTask } from '@/queries/task'
import { useContextMenu } from 'mantine-contextmenu'

type TaskRowProps = {
  task: Task
  canEdit: boolean | undefined
  onClick?: (task: Task) => void | Promise<void>
}

export default function TaskRow({ task, canEdit, onClick }: TaskRowProps) {
  const { isMobile } = useSidebar()
  const colorMemo = useMemo(() => getPriorityColor(task.priority), [task.priority])
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()
  const { showContextMenu } = useContextMenu()
  const [hovered, setHovered] = useState(false)

  const handleToggleTask = async (task: Task) => {
    if (!task.listId) return
    await toggleTask.mutateAsync({ listId: task.listId, taskId: task.id })
  }

  const handleDeleteTask = async (task: Task) => {
    if (!canEdit) return
    if (!task.listId) return
    await deleteTask.mutateAsync({ listId: task.listId, taskId: task.id })
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit
  })

  const menuOptions = [
    {
      key: 'edit',
      icon: <IconEdit size={14} />,
      title: 'Edit',
      onClick: () => {
        onClick?.(task)
      },
      disabled: !canEdit
    },
    {
      key: 'delete',
      icon: <IconTrash size={14} />,
      title: 'Delete',
      color: 'red',
      onClick: () => {
        handleDeleteTask(task)
      },
      disabled: !canEdit
    }
  ]

  return (
    <Group
      ref={setNodeRef}
      wrap="nowrap"
      justify="space-between"
      align="center"
      px="xs"
      py={8}
      style={{
        borderRadius: 6,
        cursor: 'default',
        transform: CSS.Transform.toString(transform),

        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,.18)' : undefined,

        opacity: isDragging ? 0.95 : 1,
        zIndex: isDragging ? 100 : 1
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Group wrap="nowrap" gap="sm" flex={1} align="flex-start">
        <ActionIcon
          {...attributes}
          {...listeners}
          variant="transparent"
          color="gray"
          size="sm"
          style={{
            opacity: canEdit && (isMobile || hovered) ? 1 : 0,
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
            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return
            if ((e.target as HTMLElement).closest('button')) return
            onClick?.(task)
          }}
        >
          <Checkbox
            radius="xl"
            checked={task.completed}
            disabled={!canEdit}
            onChange={() => {
              handleToggleTask(task)
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

          <Stack gap={2} flex={1} onContextMenu={showContextMenu(menuOptions)}>
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
      </Group>
    </Group>
  )
}
