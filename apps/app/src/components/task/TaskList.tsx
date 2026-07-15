'use client'

import { Task } from '@/models/task'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { Group, Modal, Stack, Text } from '@mantine/core'
import { useMemo, useState } from 'react'
import TaskRow from './TaskRow'
import { useDisclosure } from '@mantine/hooks'
import { useSidebar } from '@/providers/SidebarProvider'
import EditTask from '../modals/EditTask'
import { IconList } from '@tabler/icons-react'

type TaskListProps = {
  title: string
  data: Task[]
  canEdit?: boolean
  onReorder?: (movedTaskId: string, targetTaskId: string, sectionId: string) => void | Promise<void>
  onUpdate: (taskId: string, updates: Partial<Task>) => void | Promise<void>
}

export default function TaskList({ title, data, canEdit, onReorder, onUpdate }: TaskListProps) {
  const { isMobile } = useSidebar()
  const tasks = useMemo(() => [...data].sort((a, b) => a.order - b.order), [data])
  const [opened, { open, close }] = useDisclosure(false)
  const [selectedTaskId, setSelectedTask] = useState<string | null>(null)
  const task = useMemo(
    () => tasks.find(t => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const taskClickHandler = (task: Task) => {
    setSelectedTask(task.id)
    open()
  }

  const ids = useMemo(() => tasks.map(t => t.id), [tasks])

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const movedTask = tasks.find(t => t.id === active.id)
    const targetTask = tasks.find(t => t.id === over.id)

    const sectionId = movedTask?.sectionId

    if (!movedTask || !targetTask || !sectionId) return

    if (onReorder) {
      try {
        await onReorder(movedTask.id, targetTask.id, sectionId)
      } catch { }
    }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <Stack gap={0}>
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} onClick={taskClickHandler} canEdit={canEdit} />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
      {task && (
        <Modal
          opened={opened}
          onClose={close}
          fullScreen={isMobile}
          size="xl"
          title={
            <Group gap="xs" onClick={close} align='center'>
              <IconList size={18} stroke={1.8} />
              <Text fw={600}>
                {title}
              </Text>
            </Group>
          }
          p={0}
        >
          <EditTask task={task} onUpdate={onUpdate} canEdit={canEdit} />
        </Modal>
      )}
    </>
  )
}
