/* Simplist service worker: install/activate, Web Push reminders and notification clicks. */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// PUSH
// Payload sent by the API (PushPayload in apps/api/src/infrastructure/push/push.client.ts):
// { title, body?, url?, tag? }

self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Simplist'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    data: { url: data.url || '/' }
  }
  if (data.tag) {
    // Same tag replaces the previous notification (e.g. the same task); renotify still alerts
    options.tag = data.tag
    options.renotify = true
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// CLICK: focus an open window and let the app route there (no reload), or open one

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = windows.find(item => new URL(item.url).origin === self.location.origin)
      if (client) {
        await client.focus()
        // Handled in PWARegister.tsx
        client.postMessage({ type: 'navigate', url })
        return
      }
      await self.clients.openWindow(url)
    })()
  )
})

// SUBSCRIPTION RENEWAL: the browser rotated the push subscription, register the new one.
// Best effort: the app also re-registers the current subscription each time it starts.

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, char => char.charCodeAt(0))
}

self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    (async () => {
      let subscription = event.newSubscription
      if (!subscription) {
        const response = await fetch('/api/notifications/config', { credentials: 'same-origin' })
        if (!response.ok) return
        const { data } = await response.json()
        if (!data || !data.enabled || !data.publicKey) return
        subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey)
        })
      }

      await fetch('/api/notifications/devices', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subscription.toJSON(),
          ...(event.oldSubscription ? { previousEndpoint: event.oldSubscription.endpoint } : {})
        })
      })
    })().catch(() => {})
  )
})
