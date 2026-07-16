import { useState } from 'react'
import { PlannedTask } from '@/models/task'
import { useToggleTask } from '@/queries/task'

export function useTaskCompletion(task: PlannedTask) {
  const toggleTask = useToggleTask()
  const [completed, setCompleted] = useState(task.completed)

  const toggle = async () => {
    const next = !completed
    setCompleted(next)
    try {
      await toggleTask.mutateAsync({ listId: task.listId, taskId: task.id })
    } catch {
      setCompleted(!next)
    }
  }

  return { completed, toggle }
}