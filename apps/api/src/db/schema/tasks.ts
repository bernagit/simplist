import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

import { lists } from './lists.js'
import { sections } from './sections.js'
import { users } from './users.js'

export const priorityEnum = pgEnum('task_priority', ['low', 'medium', 'high'])
export type TaskPriority = 'low' | 'medium' | 'high'

export const tasks = pgTable(
  'tasks',
  {
    id: uuid().primaryKey().defaultRandom(),

    listId: uuid('list_id')
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),

    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),

    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id),

    title: text('title').notNull(),

    description: text('description'),

    completed: boolean('completed').notNull().default(false),

    dueDate: date('due_date'),

    dueTime: time('due_time'),

    durationMinutes: integer('duration_minutes'),

    recurrenceRule: text('recurrence_rule'),

    priority: priorityEnum('priority'),

    order: varchar('order', { length: 255 }).notNull().default('0'),

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
  },
  table => [
    // Reminders and date views look up open tasks by due date
    index('tasks_open_due_date_idx')
      .on(table.dueDate)
      .where(sql`${table.completed} = false and ${table.dueDate} is not null`)
  ]
)
