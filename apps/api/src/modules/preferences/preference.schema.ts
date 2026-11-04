import z from 'zod'

export const updatePreferencesSchema = z.object({
  body: z.object({
    themeColor: z.string().optional(),
    colorScheme: z.enum(['light', 'dark', 'auto']).optional(),
    defaultView: z.string().optional(),
    startOfWeek: z.enum(['monday', 'sunday']).optional(),
    confirmDelete: z.boolean().optional(),
    settings: z
      .object({
        syncAppearance: z.boolean().optional(),
        /** The guided tour was completed or skipped (it starts by itself until then) */
        onboardingDone: z.boolean().optional()
      })
      .optional()
  })
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>['body']
