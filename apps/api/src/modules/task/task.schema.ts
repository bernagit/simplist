/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().max(200),
    description: z.string().max(1000).optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    priority: z.enum(['high', 'medium', 'low']).optional().nullable(),
    order: z.number().int().optional()
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

export const reorderTaskSchema = z.object({
  body: z.object({
    tasks: z.array(
      z.object({
        id: z.uuid(),
        order: z.number().int()
      })
    )
  }),
  params: z.object({
    listId: z.uuid()
  })
})

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    priority: z.enum(['high', 'medium', 'low']).optional().nullable(),
    completed: z.boolean().optional()
  }),
  params: z.object({
    id: z.uuid()
  })
})

export type TaskIdInput = z.infer<typeof taskIdSchema>['params']
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body']
export type CreateTaskParams = z.infer<typeof createTaskSchema>['params']
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body']
export type UpdateTaskParams = z.infer<typeof updateTaskSchema>['params']
export type ReorderTaskInput = z.infer<typeof reorderTaskSchema>['body']
export type ReorderTaskParams = z.infer<typeof reorderTaskSchema>['params']
