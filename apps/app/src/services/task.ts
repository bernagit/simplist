import { Resp } from '@/models/base'
import { CreateTaskInput, PlannedTask, Task } from '@/models/task'
import api from '@/utils/ky'

async function createTask(data: CreateTaskInput): Promise<Resp<Task>> {
  const { listId, sectionId, ...rest } = data
  let url = `tasks/${listId}`
  if (sectionId) {
    url += `/${sectionId}`
  }
  return await api.post(url, { json: rest }).json()
}

async function toggleCompleteTask(taskId: string): Promise<null> {
  return await api.patch(`tasks/${taskId}/toggle`).json()
}

async function updateTask(taskId: string, input: Partial<CreateTaskInput>): Promise<Resp<Task>> {
  return await api.put(`tasks/${taskId}`, { json: input }).json()
}

async function deleteTask(taskId: string): Promise<null> {
  return await api.delete(`tasks/${taskId}`).json()
}

async function reorderTasks(input: {
  listId: string
  sourceSectionId: string
  targetSectionId: string
  movedTaskId: string
  targetTaskId: string | undefined
}): Promise<Resp<Task[]>> {
  return await api
    .put(`tasks/${input.listId}/${input.sourceSectionId}/reorder`, {
      json: {
        movedTaskId: input.movedTaskId,
        targetTaskId: input.targetTaskId,
        targetSectionId: input.targetSectionId
      }
    })
    .json()
}

async function getPlannedTasks(
  startDate: Date,
  endDate: Date,
  listId?: string
): Promise<Resp<PlannedTask[]>> {
  const body: { startDate: string; endDate: string; listId?: string } = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }
  if (listId) {
    body.listId = listId
  }
  return await api.post('tasks/planned', { json: body }).json()
}

export const tasksService = {
  createTask,
  toggleCompleteTask,
  updateTask,
  deleteTask,
  reorderTasks,
  getPlannedTasks
}
