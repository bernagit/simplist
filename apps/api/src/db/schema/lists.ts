import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const lists = pgTable('lists', {
  id: uuid().primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),
  description: text('description'),
  color: varchar('color', { length: 25 }),
  icon: varchar('icon', { length: 100 }),

  archivedAt: timestamp('archived_at', {
    withTimezone: true
  }),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp('deleted_at', {
    withTimezone: true
  })
})
