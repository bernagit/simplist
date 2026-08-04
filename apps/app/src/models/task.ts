export type Task = {
  id: string
  listId: string
  sectionId: string
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null
  dueTime: string | null
  durationMinutes: number | null
  recurrenceRule: string | null
  priority: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export type PlannedTask = Task & {
  color: string
  listTitle: string
  sectionTitle: string | null
}

export type CreateTaskInput = {
  listId: string
  sectionId: string
  title: string
  description: string | null
  dueDate: string | null
  dueTime: string | null
  durationMinutes: number | null
  recurrenceRule: string | null
  priority: string | null
  order?: number
}

export type UpdateTaskInput = {
  title?: string
  description?: string | null
  dueDate?: string | null
  dueTime?: string | null
  durationMinutes?: number | null
  recurrenceRule?: string | null
  priority?: string | null
  listId?: string
  sectionId?: string
  completed?: boolean
  order?: number
}
