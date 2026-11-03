/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

/** Lead times offered for timed tasks, in minutes (0 = at the task's time) */
export const LEAD_MINUTES = [0, 5, 10, 15, 30, 60, 120, 1440] as const

const subscriptionBody = z.object({
  endpoint: z.url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(256)
  }),
  /** The endpoint this one replaces (service worker `pushsubscriptionchange`) */
  previousEndpoint: z.url().max(2048).optional()
})

export const subscribeSchema = z.object({
  body: subscriptionBody
})

export const unsubscribeSchema = z.object({
  body: z.object({
    endpoint: z.url().max(2048)
  })
})

export const deviceIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export const updateSettingsSchema = z.object({
  body: z.object({
    enabled: z.boolean().optional(),
    timezone: z.string().min(1).max(64).optional(),
    allDayTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM')
      .optional(),
    leadMinutes: z
      .number()
      .int()
      .refine(value => (LEAD_MINUTES as readonly number[]).includes(value), 'Unsupported lead time')
      .optional(),
    sharedLists: z.boolean().optional()
  })
})

/** The test notification is written by the app, in the user's language */
export const testNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    body: z.string().max(200).optional()
  })
})

export type SubscribeInput = z.infer<typeof subscribeSchema>['body']
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>['body']
export type DeviceIdInput = z.infer<typeof deviceIdSchema>['params']
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body']
export type TestNotificationInput = z.infer<typeof testNotificationSchema>['body']
