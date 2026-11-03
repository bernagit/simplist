import pushConfig from '../../config/push.js'
import { createModuleLogger } from '../../infrastructure/logging/logger.js'
import {
  isPushEnabled,
  PushOptions,
  PushPayload,
  sendPush
} from '../../infrastructure/push/push.client.js'
import { Errors } from '../../types/http.js'
import { NotificationRepository } from './notification.repository.js'
import {
  SubscribeInput,
  TestNotificationInput,
  UpdateSettingsInput
} from './notification.schema.js'

/** A device is dropped after this many failed deliveries in a row */
const MAX_DELIVERY_FAILURES = 5
/** Parallel requests to push services */
const SEND_CONCURRENCY = 20
/** Seconds a test notification waits for an offline device */
const TEST_TTL_SECONDS = 60

export type OutgoingPush = {
  userId: string
  payload: PushPayload
  options: PushOptions
}

export type DeliveryReport = { sent: number; failed: number; removed: number }

/** Settings as the app sees them: times without seconds */
function toSettingsDto(
  settings: Awaited<ReturnType<NotificationRepository['findOrCreateSettings']>>
) {
  return {
    enabled: settings.enabled,
    timezone: settings.timezone,
    allDayTime: settings.allDayTime.slice(0, 'HH:MM'.length),
    leadMinutes: settings.leadMinutes,
    sharedLists: settings.sharedLists
  }
}

async function inChunks<T>(items: T[], size: number, run: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(run))
  }
}

export class NotificationService {
  private readonly logger = createModuleLogger('NotificationService')
  private readonly repository = new NotificationRepository()

  private assertEnabled() {
    if (!isPushEnabled) {
      throw Errors.conflict('Push notifications are not configured on this server')
    }
  }

  getConfig() {
    return {
      enabled: isPushEnabled,
      publicKey: pushConfig?.publicKey ?? null
    }
  }

  // DEVICES

  async subscribe(userId: string, input: SubscribeInput, userAgent: string | null) {
    this.assertEnabled()
    if (input.previousEndpoint && input.previousEndpoint !== input.endpoint) {
      await this.repository.deleteSubscriptionByEndpoint(input.previousEndpoint, userId)
    }
    const subscription = await this.repository.upsertSubscription(userId, {
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent
    })
    return { id: subscription!.id }
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.repository.deleteSubscriptionByEndpoint(endpoint, userId)
  }

  async listDevices(userId: string) {
    return this.repository.listDevices(userId)
  }

  async removeDevice(userId: string, deviceId: string) {
    const removed = await this.repository.deleteSubscription(deviceId, userId)
    if (!removed) throw Errors.notFound('Device not found')
  }

  // SETTINGS

  async getSettings(userId: string) {
    return toSettingsDto(await this.repository.findOrCreateSettings(userId))
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    if (input.timezone && !(await this.repository.isKnownTimezone(input.timezone))) {
      throw Errors.badRequest(`Unknown time zone: ${input.timezone}`)
    }
    return toSettingsDto(await this.repository.updateSettings(userId, input))
  }

  // DELIVERY

  async sendTest(userId: string, input: TestNotificationInput) {
    this.assertEnabled()
    const report = await this.deliver([
      {
        userId,
        payload: { title: input.title, body: input.body ?? '', url: '/', tag: 'test' },
        options: { ttl: TEST_TTL_SECONDS, urgency: 'high' }
      }
    ])
    if (report.sent === 0 && report.failed === 0 && report.removed === 0) {
      throw Errors.notFound('No device has notifications enabled')
    }
    return report
  }

  /**
   * Sends each message to every device of its user. Expired devices are deleted, failing
   * ones are dropped after MAX_DELIVERY_FAILURES attempts in a row.
   */
  async deliver(messages: OutgoingPush[]): Promise<DeliveryReport> {
    const report: DeliveryReport = { sent: 0, failed: 0, removed: 0 }
    if (!isPushEnabled || messages.length === 0) return report

    const userIds = [...new Set(messages.map(message => message.userId))]
    const targets = await this.repository.getTargets(userIds)
    const targetsByUser = new Map<string, typeof targets>()
    for (const target of targets) {
      targetsByUser.set(target.userId, [...(targetsByUser.get(target.userId) ?? []), target])
    }

    const jobs = messages.flatMap(message =>
      (targetsByUser.get(message.userId) ?? []).map(target => ({ target, message }))
    )

    const delivered = new Set<string>()
    const failed = new Set<string>()
    const gone = new Set<string>()

    await inChunks(jobs, SEND_CONCURRENCY, async ({ target, message }) => {
      const result = await sendPush(target, message.payload, message.options)
      if (result.status === 'sent') {
        delivered.add(target.id)
        report.sent++
      } else if (result.status === 'gone') {
        gone.add(target.id)
        report.removed++
      } else {
        failed.add(target.id)
        report.failed++
        this.logger.warn(`Push to device ${target.id} failed: ${result.reason}`)
      }
    })

    await this.repository.deleteSubscriptions([...gone])
    await this.repository.markDelivered([...delivered].filter(id => !failed.has(id)))
    const exhausted = await this.repository.markFailed(
      [...failed].filter(id => !gone.has(id)),
      MAX_DELIVERY_FAILURES
    )
    if (exhausted.length > 0) {
      await this.repository.deleteSubscriptions(exhausted)
      report.removed += exhausted.length
    }

    return report
  }
}
