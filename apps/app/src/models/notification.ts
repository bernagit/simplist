export type NotificationConfig = {
  /** The server has VAPID keys: push can be used */
  enabled: boolean
  publicKey: string | null
}

export type NotificationSettings = {
  enabled: boolean
  timezone: string
  /** 'HH:MM': when tasks with a date but no time are reminded */
  allDayTime: string
  /** Minutes before a timed task (0 = at its time) */
  leadMinutes: number
  sharedLists: boolean
}

export type NotificationDevice = {
  id: string
  endpoint: string
  userAgent: string | null
  lastSuccessAt: string | null
  createdAt: string
}

export type DeviceInput = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  previousEndpoint?: string
}

export type DeliveryReport = { sent: number; failed: number; removed: number }

/** Must match LEAD_MINUTES in apps/api/src/modules/notifications/notification.schema.ts */
export const LEAD_MINUTES = [0, 5, 10, 15, 30, 60, 120, 1440] as const
