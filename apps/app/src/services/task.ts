import { Resp } from '@/models/base'
import { CreateTaskInput, Task } from '@/models/task'
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

export const tasksService = {
  createTask,
  toggleCompleteTask,
  updateTask
}
