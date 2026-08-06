'use client'

import { Task } from '@/models/task'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Stack } from '@mantine/core'
import { useMemo } from 'react'
import TaskRow from './TaskRow'

type TaskListProps = {
  data: Task[]
  sectionId: string
  canEdit?: boolean
}

export default function TaskList({ data, sectionId, canEdit }: TaskListProps) {
  const tasks = useMemo(() => [...data].sort((a, b) => (a.order ?? '').localeCompare(b.order ?? '')), [data])
  const ids = useMemo(() => tasks.map(t => t.id), [tasks])

  // Allows dropping tasks into empty section containers
  const { setNodeRef } = useDroppable({
    id: sectionId
  })

  return (
    <div ref={setNodeRef} style={{ minHeight: 10 }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Stack gap={0}>
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} canEdit={canEdit} />
          ))}
        </Stack>
      </SortableContext>
    </div>
  )
}