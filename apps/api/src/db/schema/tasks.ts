import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { lists } from './lists'
import { sections } from './sections'
import { users } from './users'

export const priorityEnum = pgEnum('task_priority', ['low', 'medium', 'high'])
export type TaskPriority = 'low' | 'medium' | 'high'

export const tasks = pgTable('tasks', {
  id: uuid().primaryKey().defaultRandom(),

  listId: uuid('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),

  sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'set null' }),

  creatorId: uuid('creator_id')
    .notNull()
    .references(() => users.id),

  title: text('title').notNull(),

  description: text('description'),

  completed: boolean('completed').notNull().default(false),

  dueDate: timestamp('due_date', {
    withTimezone: true
  }),

  priority: priorityEnum('priority'),

  order: integer('order').notNull().default(0),

  createdAt: timestamp('created_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true
  })
    .defaultNow()
    .notNull()
})
