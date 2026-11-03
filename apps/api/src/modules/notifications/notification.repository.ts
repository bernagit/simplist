import { and, desc, eq, inArray, lt, sql } from 'drizzle-orm'
import {
  notificationSettings,
  pushSubscriptions,
  taskReminders
} from '../../db/schema/notifications.js'
import db from '../../infrastructure/database/db.js'
import { UpdateSettingsInput } from './notification.schema.js'
import { DueReminderRow, dueRemindersQuery } from './reminder.query.js'

export type DueReminder = {
  taskId: string
  userId: string
  /** Occurrence the reminder is for (also its dedupe key) */
  dueAt: Date
  title: string
  dueTime: string | null
  listId: string
  sectionId: string
  listTitle: string
  sectionTitle: string | null
  /** The list belongs to someone else */
  shared: boolean
}

export class NotificationRepository {
  // SUBSCRIPTIONS

  /** One row per endpoint: a device that changes account moves to the new user. */
  async upsertSubscription(
    userId: string,
    data: { endpoint: string; p256dh: string; auth: string; userAgent: string | null }
  ) {
    const now = new Date()
    const [subscription] = await db
      .insert(pushSubscriptions)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId,
          p256dh: data.p256dh,
          auth: data.auth,
          userAgent: data.userAgent,
          failureCount: 0,
          updatedAt: now
        }
      })
      .returning()
    return subscription
  }

  async deleteSubscriptionByEndpoint(endpoint: string, userId?: string) {
    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.endpoint, endpoint),
          userId ? eq(pushSubscriptions.userId, userId) : undefined
        )
      )
  }

  async deleteSubscription(id: string, userId: string) {
    const deleted = await db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.id, id), eq(pushSubscriptions.userId, userId)))
      .returning({ id: pushSubscriptions.id })
    return deleted.length > 0
  }

  async deleteSubscriptions(ids: string[]) {
    if (ids.length === 0) return
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, ids))
  }

  /** Devices of a user, without their keys */
  async listDevices(userId: string) {
    return db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        userAgent: pushSubscriptions.userAgent,
        lastSuccessAt: pushSubscriptions.lastSuccessAt,
        createdAt: pushSubscriptions.createdAt
      })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .orderBy(desc(pushSubscriptions.createdAt))
  }

  async getTargets(userIds: string[]) {
    if (userIds.length === 0) return []
    return db
      .select({
        id: pushSubscriptions.id,
        userId: pushSubscriptions.userId,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth
      })
      .from(pushSubscriptions)
      .where(inArray(pushSubscriptions.userId, userIds))
  }

  async markDelivered(ids: string[]) {
    if (ids.length === 0) return
    await db
      .update(pushSubscriptions)
      .set({ failureCount: 0, lastSuccessAt: new Date() })
      .where(inArray(pushSubscriptions.id, ids))
  }

  /** Counts a failed delivery; returns the subscriptions that reached `maxFailures`. */
  async markFailed(ids: string[], maxFailures: number) {
    if (ids.length === 0) return []
    const rows = await db
      .update(pushSubscriptions)
      .set({ failureCount: sql`${pushSubscriptions.failureCount} + 1` })
      .where(inArray(pushSubscriptions.id, ids))
      .returning({ id: pushSubscriptions.id, failureCount: pushSubscriptions.failureCount })
    return rows.filter(row => row.failureCount >= maxFailures).map(row => row.id)
  }

  // SETTINGS

  async findOrCreateSettings(userId: string) {
    await db.insert(notificationSettings).values({ userId }).onConflictDoNothing()
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
    return settings!
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    const [settings] = await db
      .insert(notificationSettings)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: { ...input, updatedAt: new Date() }
      })
      .returning()
    return settings!
  }

  /** Postgres converts the due dates with its own time zone database: check it knows the name. */
  async isKnownTimezone(timezone: string) {
    const result = await db.execute(
      sql`select 1 from pg_timezone_names where name = ${timezone} limit 1`
    )
    return result.rows.length > 0
  }

  // REMINDERS

  /** Reminders due now, see dueRemindersQuery */
  async findDueReminders(now: Date, graceMinutes: number, limit: number): Promise<DueReminder[]> {
    const result = await db.execute<DueReminderRow>(dueRemindersQuery(now, graceMinutes, limit))

    return result.rows.map(row => ({
      taskId: row.task_id,
      userId: row.user_id,
      dueAt: new Date(row.due_at),
      title: row.title,
      dueTime: row.due_time,
      listId: row.list_id,
      sectionId: row.section_id,
      listTitle: row.list_title,
      sectionTitle: row.section_title,
      shared: row.shared
    }))
  }

  /**
   * Claims reminders before sending them: only the rows this call inserted come back, so
   * concurrent senders (several API instances) never deliver the same reminder twice.
   */
  async claimReminders(reminders: { taskId: string; userId: string; dueAt: Date }[]) {
    if (reminders.length === 0) return []
    return db.insert(taskReminders).values(reminders).onConflictDoNothing().returning({
      taskId: taskReminders.taskId,
      userId: taskReminders.userId,
      dueAt: taskReminders.dueAt
    })
  }

  async deleteRemindersSentBefore(date: Date) {
    await db.delete(taskReminders).where(lt(taskReminders.sentAt, date))
  }
}
