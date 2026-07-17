import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users.js'
import { lists } from './lists.js'

export const listRoleEnum = pgEnum('list_role', ['owner', 'editor', 'viewer'])
export type ListMemberRole = 'owner' | 'editor' | 'viewer'

export const listMembers = pgTable('list_members', {
  id: uuid().primaryKey().defaultRandom(),

  listId: uuid('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  role: listRoleEnum().notNull(),

  joinedAt: timestamp('joined_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})
