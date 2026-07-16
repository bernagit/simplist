export type Task = {
  id: string
  listId: string
  sectionId: string | null
  title: string
  description: string | null
  completed: boolean
  dueDate: Date | null
  priority: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export type PlannedTask = Task & {
  color: string
  listTitle: string
}

export type CreateTaskInput = {
  listId: string
  sectionId: string | null
  title: string
  description: string | null
  dueDate: Date | null
  priority: string | null
  order?: number
}

export type UpdateTaskInput = {
  title?: string
  description?: string | null
  dueDate?: Date | null
  priority?: string | null
  listId?: string
  sectionId?: string | null
  completed?: boolean
  order?: number
}
