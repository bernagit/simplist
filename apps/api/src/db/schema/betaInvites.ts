import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const betaInvites = pgTable('beta_invites', {
  id: uuid().defaultRandom().primaryKey(),

  email: varchar('email', { length: 255 }).notNull().unique(),

  token: varchar('token', { length: 255 }).notNull().unique(),

  used: boolean('used').notNull().default(false),

  expiresAt: timestamp('expires_at', {
    withTimezone: true
  }).notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})
