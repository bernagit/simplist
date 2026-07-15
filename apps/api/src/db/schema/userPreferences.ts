import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),

  themeColor: varchar('theme_color', { length: 32 }).$type<string>().notNull().default('pink'),
  colorScheme: varchar('color_scheme', { length: 16 })
    .$type<'light' | 'dark' | 'auto'>()
    .notNull()
    .default('auto'),

  defaultView: varchar('default_view', { length: 255 }).notNull().default('home'),

  startOfWeek: varchar('start_of_week', { length: 16 })
    .$type<'monday' | 'sunday'>()
    .notNull()
    .default('monday'),

  settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),

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
