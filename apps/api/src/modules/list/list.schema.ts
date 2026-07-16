/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from 'zod'

export const createListSchema = z.object({
  body: z.object({
    title: z.string().max(255).min(1),
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

export const addMemberSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    shareWithEmail: z.email(),
    role: z.enum(['viewer', 'editor'])
  })
})

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    memberId: z.uuid()
  })
})

export const changeMemberRoleSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    memberId: z.uuid(),
    role: z.enum(['viewer', 'editor'])
  })
})

export type ListCreateInput = z.infer<typeof createListSchema>['body']
export type ListIdInput = z.infer<typeof listIdSchema>['params']
export type ListUpdateInput = z.infer<typeof updateListSchema>['body']
export type ListAddMemberInput = z.infer<typeof addMemberSchema>['body']
export type ListChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>['body']
export type ListRemoveMemberInput = z.infer<typeof removeMemberSchema>['body']
