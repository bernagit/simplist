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
  reminderEnabled: boolean
  /** Timed tasks: minutes before; null = the user's default */
  reminderLeadMinutes: number | null
  /** All-day tasks: 'HH:MM[:SS]' on the due date; null = the user's default */
  reminderTime: string | null
  order: string
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
  reminderEnabled: boolean
  reminderLeadMinutes: number | null
  reminderTime: string | null
}

/** The task fields edited by the date/repeat/reminder/priority pickers */
export type TaskProperties = Pick<
  Task,
  | 'dueDate'
  | 'dueTime'
  | 'durationMinutes'
  | 'recurrenceRule'
  | 'priority'
  | 'reminderEnabled'
  | 'reminderLeadMinutes'
  | 'reminderTime'
>

export const EMPTY_TASK_PROPERTIES: TaskProperties = {
  dueDate: null,
  dueTime: null,
  durationMinutes: null,
  recurrenceRule: null,
  priority: null,
  reminderEnabled: false,
  reminderLeadMinutes: null,
  reminderTime: null
}

export type UpdateTaskInput = {
  title?: string
  description?: string | null
  dueDate?: string | null
  dueTime?: string | null
  durationMinutes?: number | null
  recurrenceRule?: string | null
  priority?: string | null
  reminderEnabled?: boolean
  reminderLeadMinutes?: number | null
  reminderTime?: string | null
  listId?: string
  sectionId?: string
  completed?: boolean
  order?: string
}
