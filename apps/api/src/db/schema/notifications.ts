import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

import { tasks } from './tasks.js'
import { users } from './users.js'

/** A browser/device that accepted Web Push for a user (one row per push endpoint). */
export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid().primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** Push service URL: unique per browser profile, it identifies the device */
    endpoint: text('endpoint').notNull().unique(),

    /** Keys used to encrypt the payload for this browser */
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),

    userAgent: text('user_agent'),

    /** Consecutive failed deliveries (not counting "gone", which deletes the row) */
    failureCount: integer('failure_count').notNull().default(0),

    lastSuccessAt: timestamp('last_success_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  table => [index('push_subscriptions_user_id_idx').on(table.userId)]
)

/** Per-user reminder settings, shared by all their devices. */
export const notificationSettings = pgTable('notification_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),

  /** Task reminders on/off for the account (devices are enabled one by one on top of this) */
  enabled: boolean('enabled').notNull().default(false),

  /** IANA time zone: due dates and times are wall-clock values in this zone */
  timezone: varchar('timezone', { length: 64 }).notNull().default('UTC'),

  /** When to remind about tasks with a date but no time */
  allDayTime: time('all_day_time').notNull().default('09:00'),

  /** How long before a timed task to remind (0 = at its time) */
  leadMinutes: integer('lead_minutes').notNull().default(0),

  /** Also remind about tasks in lists shared with the user */
  sharedLists: boolean('shared_lists').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

/**
 * Reminders already sent. The unique key makes each reminder go out at most once, also with
 * several API instances: a sender first claims the row, then delivers.
 * `dueAt` is the occurrence it was for, so moving the task (or the next occurrence of a
 * recurring task) gets a new reminder.
 */
export const taskReminders = pgTable(
  'task_reminders',
  {
    id: uuid().primaryKey().defaultRandom(),

    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),

    sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull()
  },
  table => [
    unique('task_reminders_task_user_due_unique').on(table.taskId, table.userId, table.dueAt),
    index('task_reminders_sent_at_idx').on(table.sentAt)
  ]
)
