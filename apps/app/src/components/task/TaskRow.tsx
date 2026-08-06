'use client'

import { Task } from '@/models/task'
import { ActionIcon, Checkbox, Group, Stack, Text } from '@mantine/core'
import {
  IconCalendar,
  IconChecklist,
  IconEdit,
  IconGripVertical,
  IconTrash
} from '@tabler/icons-react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPriorityColor } from '@/utils/color'
import { useSidebar } from '@/providers/SidebarProvider'
import { useDeleteTask, useToggleTask } from '@/queries/task'
import { useContextMenu } from 'mantine-contextmenu'
import { contextMenuStyles, getHTMLSectionId } from '@/utils/misc'
import { editTaskModal } from '@/lib/modals/task'
import { useQueryClient } from '@tanstack/react-query'
import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { listKeys } from '@/queries/lists'
import { useRouter } from 'next/navigation'
import { useMe } from '@/queries/auth'

type TaskRowProps = {
  task: Task
  canEdit: boolean | undefined
}

export default function TaskRow({ task, canEdit }: TaskRowProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const colorMemo = useMemo(() => getPriorityColor(task.priority), [task.priority])
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()
  const { showContextMenu, isContextMenuVisible } = useContextMenu()
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const queryClient = useQueryClient()
  const { data: me } = useMe()

  const linkMemo = useMemo(() => {
    const list = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(task.listId))?.data
    // check if it is a shared list and if the user is the owner
    const isSharedList = list?.ownerId !== me?.id
    const listUrl = isSharedList ? `/lists/shared/${task.listId}` : `/lists/${task.listId}`
    let sectionUrl = listUrl
    if (task.sectionId && task.sectionId !== list?.defaultSectionId) {
      sectionUrl += `#${getHTMLSectionId(task.sectionId)}`
    }
    return {
      listUrl,
      sectionUrl
    }
  }, [task.listId, task.sectionId, queryClient, me?.id])

  const handleToggleTask = async (task: Task) => {
    if (!task.listId) return
    await toggleTask.mutateAsync({ listId: task.listId, taskId: task.id })
  }

  const handleClick = useCallback(
    (task: Task) => {
      const list = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(task.listId))?.data
      const navigation = {
        onOpenList: () => {
          router.push(linkMemo.listUrl)
        },
        onOpenSection: () => {
          router.push(linkMemo.sectionUrl)
        }
      }
      editTaskModal(
        {
          ...task,
          color: list?.color ?? '',
          listTitle: list?.title ?? '',
          sectionTitle: list?.sections.find(section => section.id === task.sectionId)?.title ?? null
        },
        isMobile,
        canEdit,
        navigation
      )
    },
    [queryClient, isMobile, canEdit, router, linkMemo]
  )

  const handleDeleteTask = useCallback(
    async (task: Task) => {
      if (!canEdit) return
      if (!task.listId) return
      await deleteTask.mutateAsync({ listId: task.listId, taskId: task.id })
    },
    [canEdit, deleteTask]
  )

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit
  })

  const menuOptions = useMemo(
    () => [
      {
        key: 'item',
        title: task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title,
        icon: <IconChecklist size={20} />,
        disabled: true,
        onClick: () => {},
        style: {
          cursor: 'default'
        }
      },
      {
        key: 'divider'
      },
      {
        key: 'edit',
        icon: <IconEdit size={20} />,
        title: 'Edit',
        onClick: () => {
          handleClick(task)
        },
        disabled: !canEdit
      },
      {
        key: 'delete',
        icon: <IconTrash size={20} />,
        title: 'Delete',
        color: 'red',
        onClick: () => {
          handleDeleteTask(task)
        },
        disabled: !canEdit
      }
    ],
    [canEdit, handleClick, handleDeleteTask, task]
  )

  useEffect(() => {
    if (!isContextMenuVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(false)
    }
  }, [isContextMenuVisible])

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

        backgroundColor: selected
          ? 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))'
          : undefined,

        outline: selected || hovered ? '1px solid var(--mantine-primary-color-filled)' : undefined,

        outlineOffset: -1,

        boxShadow: [
          selected && 'inset 0 0 0 1px var(--mantine-primary-color-filled)',
          isDragging && '0 8px 24px rgba(0,0,0,.18)'
        ]
          .filter(Boolean)
          .join(', '),

        opacity: isDragging ? 0.95 : 1,
        zIndex: isDragging ? 100 : 1
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Group wrap="nowrap" gap="sm" flex={1} align="center">
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
          mt={0}
        >
          <IconGripVertical size={18} />
        </ActionIcon>
        <Group
          style={{ flex: 1, minWidth: 0 }}
          onClick={e => {
            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return
            if ((e.target as HTMLElement).closest('button')) return
            handleClick(task)
          }}
        >
          <Checkbox
            radius="xl"
            size="md"
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

          <Stack
            gap={2}
            flex={1}
            onContextMenu={e => {
              e.stopPropagation()
              e.preventDefault()
              setSelected(true)
              showContextMenu(menuOptions, {
                styles: contextMenuStyles
              })(e)
            }}
            style={{
              cursor: 'pointer'
            }}
          >
            <Text
              size="sm"
              fw={500}
              td={task.completed ? 'line-through' : undefined}
              c={task.completed ? 'dimmed' : 'inherit'}
              // mt={task.description ? 4 : 0}
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
