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
import { Stack } from '@mantine/core'
import { useMemo } from 'react'
import TaskRow from './TaskRow'

type TaskListProps = {
  data: Task[]
  canEdit?: boolean
  onReorder?: (movedTaskId: string, targetTaskId: string, sectionId: string) => void | Promise<void>
}

export default function TaskList({ data, canEdit, onReorder }: TaskListProps) {
  const tasks = useMemo(() => [...data].sort((a, b) => a.order - b.order), [data])

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
      } catch {}
    }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <Stack gap={0}>
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} canEdit={canEdit} />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </>
  )
}
