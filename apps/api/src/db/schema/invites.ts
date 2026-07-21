import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const invites = pgTable('invites', {
  id: uuid().defaultRandom().primaryKey(),

  email: varchar('email', { length: 255 }),

  tokenHash: varchar('token', { length: 255 }).notNull().unique(),

  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),

  used: boolean('used').notNull().default(false),

  revoked: boolean('revoked').notNull().default(false),

  expiresAt: timestamp('expires_at', {
    withTimezone: true
  }).notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})
