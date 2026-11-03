'use client'

import { useEffect } from 'react'
import { getPermission, getPushSupport, getSubscription, getTimezone, subscribe, toDeviceInput } from '@/lib/push'
import { notificationsService } from '@/services/notifications'
import { useAuth } from '@/providers/AuthProvider'

let synced = false

/**
 * Once per app start, for a signed-in user whose device has notifications on:
 * - if the account no longer has this device (removed from another device, or dropped after
 *   failed deliveries), turns notifications off here too, so the settings tell the truth;
 * - otherwise refreshes the push subscription (the server's keys may have changed);
 * - keeps the reminder time zone in line with the device (travel, daylight-saving rules).
 */
export function PushSync() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || synced) return
    if (getPushSupport() !== 'supported' || getPermission() !== 'granted') return
    synced = true

    void (async () => {
      const current = await getSubscription()
      if (!current) return

      const { data: config } = await notificationsService.getConfig()
      if (!config.enabled || !config.publicKey) return

      const { data: devices } = await notificationsService.getDevices()
      if (!devices.some(device => device.endpoint === current.endpoint)) {
        await current.unsubscribe()
        return
      }

      const subscription = await subscribe(config.publicKey)
      const previous = subscription.endpoint !== current.endpoint ? current.endpoint : undefined
      await notificationsService.registerDevice(toDeviceInput(subscription, previous))

      const { data: settings } = await notificationsService.getSettings()
      const timezone = getTimezone()
      if (settings.enabled && settings.timezone !== timezone) {
        await notificationsService.updateSettings({ timezone })
      }
    })().catch(error => {
      synced = false
      console.error('Push sync failed', error)
    })
  }, [isAuthenticated])

  return null
}
