/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const createListSchema = z.object({
  body: z.object({
    title: z.string().max(255),
    description: z.string().max(1024).optional(),
    color: z.string().max(7).optional(),
    icon: z.string().max(255).optional()
  })
})

export const listIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export const updateListSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    title: z.string().max(255).optional(),
    description: z.string().max(1024).optional(),
    color: z.string().max(7).optional(),
    icon: z.string().max(255).optional()
  })
})

export const shareListSchema = z.object({
  body: z.object({
    listId: z.uuid(),
    shareWithEmail: z.email(),
    role: z.enum(['viewer', 'editor'])
  })
})

export type ListCreateInput = z.infer<typeof createListSchema>['body']
export type ListIdInput = z.infer<typeof listIdSchema>['params']
export type ListUpdateInput = z.infer<typeof updateListSchema>['body']
export type ListShareInput = z.infer<typeof shareListSchema>['body']
