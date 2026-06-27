/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().max(200),
    description: z.string().max(1000).optional(),
    dueDate: z.coerce.date().optional(),
    order: z.number().int().optional()
  }),
  params: z.object({
    listId: z.uuid(),
    sectionId: z.uuid().optional()
  })
})

export const taskIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export type TaskIdInput = z.infer<typeof taskIdSchema>['params']
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body']
export type CreateTaskParams = z.infer<typeof createTaskSchema>['params']
