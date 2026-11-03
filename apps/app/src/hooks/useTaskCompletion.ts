import { useState } from 'react'
import { PlannedTask } from '@/models/task'
import { isRecurringOccurrence, useToggleTask } from '@/queries/task'

/**
 * Toggles completion from the task modal. Resolves with the task as saved, or null on error:
 * a recurring task moves to its next date and stays open, so the checkbox doesn't stay ticked.
 */
export function useTaskCompletion(task: PlannedTask) {
  const toggleTask = useToggleTask()
  const [completed, setCompleted] = useState(task.completed)
  const [current, setCurrent] = useState(task)

  const toggle = async (): Promise<PlannedTask | null> => {
    const previous = completed
    if (!isRecurringOccurrence({ ...current, completed })) setCompleted(!previous)
    try {
      const response = await toggleTask.mutateAsync({ listId: task.listId, taskId: task.id })
      const saved = { ...current, ...response.data }
      setCurrent(saved)
      setCompleted(saved.completed)
      return saved
    } catch {
      setCompleted(previous)
      return null
    }
  }

  return { completed, toggle }
}
