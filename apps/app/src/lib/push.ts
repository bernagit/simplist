/**
 * Browser side of Web Push: support detection and this device's push subscription.
 * The service worker (public/sw.js) shows the notifications.
 */

export type PushSupport =
  /** Push can be enabled on this device */
  | 'supported'
  /** iPhone/iPad: Web Push only works once the app is added to the Home Screen */
  | 'needs-install'
  | 'unsupported'

function isIos() {
  const { userAgent, platform, maxTouchPoints } = navigator
  // iPadOS reports itself as a Mac, but with touch
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
}

export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function getPushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported'
  const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (hasApis) return 'supported'
  return isIos() && !isStandalone() ? 'needs-install' : 'unsupported'
}

export function getPermission(): NotificationPermission {
  return typeof Notification === 'undefined' ? 'denied' : Notification.permission
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, char => char.charCodeAt(0))
}

function sameKey(subscription: PushSubscription, key: Uint8Array) {
  const current = subscription.options.applicationServerKey
  if (!current) return false
  const bytes = new Uint8Array(current)
  return bytes.length === key.length && bytes.every((byte, i) => byte === key[i])
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null
  // Registered by PWARegister; register here too in case this runs first
  const registration =
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.register('/sw.js'))
  return registration ?? null
}

export async function getSubscription() {
  if (getPushSupport() !== 'supported') return null
  const registration = await getRegistration()
  return (await registration?.pushManager.getSubscription()) ?? null
}

/**
 * Subscribes this device with the server's public key. A subscription made with another key
 * (the server's keys changed) can't receive pushes anymore: it is replaced.
 */
export async function subscribe(publicKey: string) {
  const registration = await getRegistration()
  if (!registration) throw new Error('Service worker unavailable')

  const key = urlBase64ToUint8Array(publicKey)
  const existing = await registration.pushManager.getSubscription()
  if (existing && sameKey(existing, key)) return existing
  await existing?.unsubscribe()

  return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
}

export async function unsubscribe() {
  const subscription = await getSubscription()
  if (!subscription) return null
  const { endpoint } = subscription
  await subscription.unsubscribe()
  return endpoint
}

/** The body the API expects for a device */
export function toDeviceInput(subscription: PushSubscription, previousEndpoint?: string) {
  const json = subscription.toJSON()
  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
    ...(previousEndpoint ? { previousEndpoint } : {})
  }
}

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
