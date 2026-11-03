/* eslint-disable @typescript-eslint/no-magic-numbers -- durations below are the configuration */
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import { isPushEnabled } from '../../infrastructure/push/push.client.js'
import { DueReminder, NotificationRepository } from './notification.repository.js'
import { NotificationService, OutgoingPush } from './notification.service.js'

const MS_PER_MINUTE = 60_000
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE

const config = {
  /** How often due reminders are looked up */
  intervalMs: MS_PER_MINUTE,
  /** Reminders later than this are skipped (downtime, a task created in the past...) */
  graceMinutes: 30,
  /** Reminders per query; a tick keeps going while batches come back full */
  batchSize: 500,
  maxBatchesPerTick: 20,
  /** Seconds a reminder waits for an offline device before the push service drops it */
  ttlSeconds: 12 * 60 * 60,
  /** Sent-reminder log kept for this long (it only has to outlive the grace window) */
  retentionMs: 7 * MS_PER_DAY,
  cleanupEveryMs: MS_PER_DAY
}

/** Same deep link as the search: the list page opens the task (TASK_QUERY_PARAM in the app). */
function taskUrl(reminder: DueReminder) {
  const list = reminder.shared ? `/lists/shared/${reminder.listId}` : `/lists/${reminder.listId}`
  return `${list}?task=${reminder.taskId}#section-${reminder.sectionId}`
}

/** Language-neutral, so it needs no translation on the server: "Groceries › Today · 18:30" */
function reminderBody(reminder: DueReminder) {
  const place = reminder.sectionTitle
    ? `${reminder.listTitle} › ${reminder.sectionTitle}`
    : reminder.listTitle
  const time = reminder.dueTime ? ` · ${reminder.dueTime.slice(0, 'HH:MM'.length)}` : ''
  return place + time
}

function toPush(reminder: DueReminder): OutgoingPush {
  const tag = `task-${reminder.taskId}`
  return {
    userId: reminder.userId,
    payload: {
      title: reminder.title,
      body: reminderBody(reminder),
      url: taskUrl(reminder),
      tag
    },
    options: {
      ttl: config.ttlSeconds,
      urgency: 'high',
      // A newer reminder for the same task replaces one still queued (topic: max 32 chars)
      topic: reminder.taskId.replace(/-/g, '')
    }
  }
}

const reminderKey = (r: { taskId: string; userId: string; dueAt: Date }) =>
  `${r.taskId}|${r.userId}|${r.dueAt.getTime()}`

/**
 * Sends task reminders. Runs in every API instance: claiming a reminder in the database
 * before sending makes each one go out once, however many instances run.
 * Delivery is at most once: a reminder whose push fails is not retried.
 */
export class ReminderScheduler {
  private readonly logger = createModuleLogger('ReminderScheduler')
  private readonly repository = new NotificationRepository()
  private readonly service = new NotificationService()
  private timer: NodeJS.Timeout | null = null
  private running: Promise<void> | null = null
  private lastCleanupAt = 0

  start() {
    if (!isPushEnabled) {
      this.logger.warn('Push notifications are disabled (VAPID keys not set): no reminders.')
      return
    }
    if (this.timer) return
    this.logger.info('Task reminders started.')
    this.timer = setInterval(() => this.tick(), config.intervalMs)
    this.timer.unref()
    void this.tick()
  }

  /** Stops scheduling and waits for the tick in progress, if any. */
  async stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    await this.running
  }

  /** One pass; skipped if the previous one is still running. */
  tick() {
    if (this.running) return this.running
    this.running = this.run()
      .catch(error => {
        this.logger.error(
          `Reminder tick failed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`
        )
      })
      .finally(() => {
        this.running = null
      })
    return this.running
  }

  private async run() {
    const now = new Date()

    for (let batch = 0; batch < config.maxBatchesPerTick; batch++) {
      const due = await this.repository.findDueReminders(now, config.graceMinutes, config.batchSize)
      if (due.length === 0) break

      const claimed = new Set(
        (
          await this.repository.claimReminders(
            due.map(({ taskId, userId, dueAt }) => ({ taskId, userId, dueAt }))
          )
        ).map(reminderKey)
      )
      const mine = due.filter(reminder => claimed.has(reminderKey(reminder)))

      if (mine.length > 0) {
        const report = await this.service.deliver(mine.map(toPush))
        this.logger.info(
          `Reminders: ${mine.length} due, ${report.sent} pushes sent, ${report.failed} failed, ${report.removed} devices removed`
        )
      }

      if (due.length < config.batchSize) break
    }

    if (now.getTime() - this.lastCleanupAt >= config.cleanupEveryMs) {
      this.lastCleanupAt = now.getTime()
      await this.repository.deleteRemindersSentBefore(new Date(now.getTime() - config.retentionMs))
    }
  }
}

export const reminderScheduler = new ReminderScheduler()
