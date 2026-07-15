/* eslint-disable @typescript-eslint/no-magic-numbers */
import { z } from 'zod'

export const updateCurrentUserSchema = z.object({
  body: z.object({
    name: z.string().max(255).min(1).optional()
    // email: z.email().max(255).optional()
  })
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(10).max(128)
  })
})

export const inviteSchema = z.object({
  body: z.object({
    email: z.email().max(255),
    secret: z.string().min(1)
  })
})

export const checkInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1)
  })
})

export const registerSchema = z.object({
  body: z.object({
    name: z.string().max(255).min(1),
    password: z.string().min(10).max(128),
    inviteToken: z.string().min(1)
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email().max(255),
    password: z.string().min(1)
  })
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email().max(255)
  })
})

export const passwordResetSchema = z.object({
  body: z.object({
    email: z.email().max(255),
    token: z.string().min(1),
    newPassword: z.string().min(10).max(128)
  })
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type RefreshInput = z.infer<typeof refreshSchema>
export type InviteInput = z.infer<typeof inviteSchema>['body']
export type CheckInviteInput = z.infer<typeof checkInviteSchema>['body']
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body']
export type PasswordResetInput = z.infer<typeof passwordResetSchema>['body']
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>['body']
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body']
