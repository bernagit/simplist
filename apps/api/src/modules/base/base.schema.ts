import z from 'zod'

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, { message: 'Search query cannot be empty' })
  })
})

export type SearchQuery = z.infer<typeof searchQuerySchema>['query']
