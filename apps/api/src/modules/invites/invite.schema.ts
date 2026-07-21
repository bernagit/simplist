/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const inviteSchema = z.object({
  body: z.object({
    email: z
      .email()
      .max(255)
      .transform(email => email.toLowerCase())
      .optional()
  })
})

export const checkInviteSchema = z.object({
  params: z.object({
    token: z.string().min(1)
  })
})

export const revokeInviteSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
})

export type InviteInput = z.infer<typeof inviteSchema>['body']
export type CheckInviteInput = z.infer<typeof checkInviteSchema>['params']
export type RevokeInviteInput = z.infer<typeof revokeInviteSchema>['params']
