/* eslint-disable @typescript-eslint/no-magic-numbers */
import rrule from 'rrule'
import z from 'zod'
import { LEAD_MINUTES } from '../notifications/notification.schema.js'

const { RRule } = rrule

export const recurrenceRuleSchema = z
  .string()
  .refine(value => {
    try {
      RRule.fromString(value)
      return true
    } catch {
      return false
    }
  }, 'Invalid recurrence rule')
  .optional()
  .nullable()

/** Per-task reminder; null lead/time = the user's defaults (notification settings) */
const reminderFields = {
  reminderEnabled: z.boolean().optional(),
  reminderLeadMinutes: z
    .number()
    .int()
    .refine(value => (LEAD_MINUTES as readonly number[]).includes(value), 'Unsupported lead time')
    .optional()
    .nullable(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM')
    .optional()
    .nullable()
}

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().max(200),
    description: z.string().max(1000).optional().nullable(),
    dueDate: z.iso.date().optional().nullable(),
    dueTime: z.iso.time({ precision: -1 }).optional().nullable(),
    durationMinutes: z.number().int().positive().optional().nullable(),
    recurrenceRule: recurrenceRuleSchema,
    priority: z.enum(['high', 'medium', 'low']).optional().nullable(),
    ...reminderFields
  }),
  params: z.object({
    listId: z.uuid(),
    sectionId: z.uuid()
  })
})

export const taskIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export const reorderTasksSchema = z.object({
  params: z.object({
    listId: z.uuid(),
    sectionId: z.uuid()
  }),
  body: z.object({
    movedTaskId: z.uuid(),
    targetSectionId: z.uuid(),
    prevTaskId: z.string().optional(),
    nextTaskId: z.string().optional()
  })
})

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    dueDate: z.iso.date().optional().nullable(),
    dueTime: z.iso.time({ precision: -1 }).optional().nullable(),
    durationMinutes: z.number().int().positive().optional().nullable(),
    recurrenceRule: recurrenceRuleSchema,
    priority: z.enum(['high', 'medium', 'low']).optional().nullable(),
    ...reminderFields,
    completed: z.boolean().optional()
  }),
  params: z.object({
    id: z.uuid()
  })
})

export const plannedTaskSchema = z.object({
  body: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    listId: z.string().optional()
  })
})

export type TaskIdInput = z.infer<typeof taskIdSchema>['params']
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body']
export type CreateTaskParams = z.infer<typeof createTaskSchema>['params']
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body']
export type UpdateTaskParams = z.infer<typeof updateTaskSchema>['params']
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>['body']
export type ReorderTasksParams = z.infer<typeof reorderTasksSchema>['params']
export type PlannedTaskInput = z.infer<typeof plannedTaskSchema>['body']
