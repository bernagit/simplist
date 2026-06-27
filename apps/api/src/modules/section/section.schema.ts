/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const createSectionSchema = z.object({
  body: z.object({
    listId: z.uuid(),
    title: z.string().max(255)
  })
})

export const sectionIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export type SectionIdInput = z.infer<typeof sectionIdSchema>['params']
export type CreateSectionInput = z.infer<typeof createSectionSchema>['body']
