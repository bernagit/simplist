import webpush from 'web-push'
import pushConfig from '../../config/push.js'

const { WebPushError } = webpush

if (pushConfig) {
  webpush.setVapidDetails(pushConfig.subject, pushConfig.publicKey, pushConfig.privateKey)
}

export const isPushEnabled = pushConfig !== null

export type PushTarget = {
  endpoint: string
  p256dh: string
  auth: string
}

/** What the service worker receives (see apps/app/public/sw.js). Keep it small: max ~4KB. */
export type PushPayload = {
  title: string
  body?: string
  /** App path opened on click */
  url?: string
  /** Same tag replaces the previous notification on the device */
  tag?: string
}

export type PushOptions = {
  /** Seconds the push service keeps the message for an offline device */
  ttl: number
  urgency?: 'very-low' | 'low' | 'normal' | 'high'
  /** Replaces a message with the same topic still waiting on the push service (max 32 chars) */
  topic?: string
}

export type PushResult =
  | { status: 'sent' }
  /** The subscription expired or was revoked: delete it */
  | { status: 'gone' }
  | { status: 'failed'; reason: string }

const HTTP_NOT_FOUND = 404
const HTTP_GONE = 410
/** HTTP statuses that mean the subscription no longer exists */
const GONE_STATUSES = new Set([HTTP_NOT_FOUND, HTTP_GONE])

export async function sendPush(
  target: PushTarget,
  payload: PushPayload,
  options: PushOptions
): Promise<PushResult> {
  if (!pushConfig) return { status: 'failed', reason: 'Push is not configured' }

  try {
    await webpush.sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(payload),
      {
        TTL: options.ttl,
        ...(options.urgency ? { urgency: options.urgency } : {}),
        ...(options.topic ? { topic: options.topic } : {})
      }
    )
    return { status: 'sent' }
  } catch (error) {
    if (error instanceof WebPushError && GONE_STATUSES.has(error.statusCode)) {
      return { status: 'gone' }
    }
    const reason =
      error instanceof WebPushError
        ? `${error.statusCode} ${error.body}`
        : error instanceof Error
          ? error.message
          : String(error)
    return { status: 'failed', reason }
  }
}
