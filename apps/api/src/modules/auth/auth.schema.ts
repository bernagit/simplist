/* eslint-disable @typescript-eslint/no-magic-numbers */
import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().max(255).optional(),
    email: z.email().max(255),
    password: z.string().min(10).max(128)
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email().max(255),
    password: z.string().min(1)
  })
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type RefreshInput = z.infer<typeof refreshSchema>
