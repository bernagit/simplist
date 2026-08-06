/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const createSectionSchema = z.object({
  body: z.object({
    listId: z.uuid(),
    title: z.string().max(255)
  })
})

export const updateSectionSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    title: z.string().max(255)
  })
})

export const sectionIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export const reorderSectionSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    listId: z.uuid(),
    prevSectionId: z.string().optional(),
    nextSectionId: z.string().optional()
  })
})

export type UpdateSectionInput = z.infer<typeof updateSectionSchema>['body']
export type SectionIdInput = z.infer<typeof sectionIdSchema>['params']
export type CreateSectionInput = z.infer<typeof createSectionSchema>['body']
export type ReorderSectionInput = z.infer<typeof reorderSectionSchema>['body']
