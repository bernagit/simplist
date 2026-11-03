'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getPermission,
  getPushSupport,
  getSubscription,
  getTimezone,
  PushSupport,
  subscribe,
  toDeviceInput,
  unsubscribe
} from '@/lib/push'
import { notificationsService } from '@/services/notifications'
import { notificationKeys } from '@/queries/notifications'
import { Resp } from '@/models/base'
import { NotificationSettings } from '@/models/notification'

export type EnableResult = 'enabled' | 'denied' | 'error'

/** Push state of this browser, and turning it on/off. */
export function usePushDevice(publicKey: string | null | undefined) {
  const queryClient = useQueryClient()
  const [support, setSupport] = useState<PushSupport | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    const currentSupport = getPushSupport()
    /* eslint-disable react-hooks/set-state-in-effect -- browser state, read once on mount */
    setSupport(currentSupport)
    setPermission(getPermission())
    /* eslint-enable react-hooks/set-state-in-effect */
    if (currentSupport === 'supported') {
      getSubscription()
        .then(subscription => {
          if (!cancelled) setEndpoint(subscription?.endpoint ?? null)
        })
        .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [])

  const enable = useCallback(async (): Promise<EnableResult> => {
    if (!publicKey) return 'error'
    setBusy(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return 'denied'

      const subscription = await subscribe(publicKey)
      await notificationsService.registerDevice(toDeviceInput(subscription))
      setEndpoint(subscription.endpoint)

      // The first device also turns reminders on, in this device's time zone
      const settings = queryClient.getQueryData<Resp<NotificationSettings>>(
        notificationKeys.settings()
      )?.data
      const timezone = getTimezone()
      if (!settings?.enabled || settings.timezone !== timezone) {
        const updated = await notificationsService.updateSettings({ enabled: true, timezone })
        queryClient.setQueryData(notificationKeys.settings(), updated)
      }
      return 'enabled'
    } catch (error) {
      console.error('Could not enable notifications', error)
      return 'error'
    } finally {
      setBusy(false)
      void queryClient.invalidateQueries({ queryKey: notificationKeys.devices() })
    }
  }, [publicKey, queryClient])

  const disable = useCallback(async () => {
    setBusy(true)
    try {
      const removed = await unsubscribe()
      if (removed) await notificationsService.unregisterDevice(removed)
      setEndpoint(null)
    } finally {
      setBusy(false)
      void queryClient.invalidateQueries({ queryKey: notificationKeys.devices() })
    }
  }, [queryClient])

  return { support, permission, endpoint, enabled: endpoint !== null, busy, enable, disable }
}

/**
 * On logout: stop this device's notifications, so the next person using it doesn't get the
 * previous account's reminders. Never blocks the logout for long.
 */
export async function disablePushOnThisDevice(timeoutMs = 3000) {
  const work = (async () => {
    const endpoint = await unsubscribe()
    if (endpoint) await notificationsService.unregisterDevice(endpoint)
  })().catch(() => {})
  await Promise.race([work, new Promise(resolve => setTimeout(resolve, timeoutMs))])
}
