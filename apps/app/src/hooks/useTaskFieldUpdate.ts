import { CreateTaskInput, PlannedTask } from '@/models/task'
import { useUpdateTask } from '@/queries/task'

export function useTaskFieldUpdate(task: PlannedTask) {
  const updateTask = useUpdateTask()

  const updateField = async (updates: Partial<CreateTaskInput>) => {
    if (!task.listId) return
    await updateTask.mutateAsync({ taskId: task.id, listId: task.listId, updates })
  }

  return { updateField, isUpdating: updateTask.isPending }
}
