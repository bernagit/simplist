import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { lists } from './lists'

export const sections = pgTable('sections', {
  id: uuid().primaryKey().defaultRandom(),
  listId: uuid('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),
  order: integer('order').notNull().default(0),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .notNull()
    .defaultNow()
})
