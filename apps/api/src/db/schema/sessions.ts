import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .references(() => users.id, {
        onDelete: 'cascade'
      })
      .notNull(),

    refreshTokenHash: varchar('refresh_token_hash', {
      length: 255
    }).notNull(),

    expiresAt: timestamp('expires_at', {
      withTimezone: true
    }).notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .defaultNow()
      .notNull(),

    lastUsedAt: timestamp('last_used_at', {
      withTimezone: true
    })
      .defaultNow()
      .notNull()
  },
  table => [
    index('sessions_user_idx').on(table.userId),
    index('sessions_refresh_idx').on(table.refreshTokenHash)
  ]
)
