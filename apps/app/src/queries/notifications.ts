import { Resp } from '@/models/base'
import { NotificationSettings } from '@/models/notification'
import { notificationsService } from '@/services/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const notificationKeys = {
  all: ['notifications'] as const,
  config: () => [...notificationKeys.all, 'config'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
  devices: () => [...notificationKeys.all, 'devices'] as const
}

export function useNotificationConfig(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.config(),
    queryFn: notificationsService.getConfig,
    // Changes only when the server is reconfigured
    staleTime: Infinity,
    enabled
  })
}

export function useNotificationSettings(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: notificationsService.getSettings,
    enabled
  })
}

export function useNotificationDevices(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.devices(),
    queryFn: notificationsService.getDevices,
    enabled
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Partial<NotificationSettings>) =>
      notificationsService.updateSettings(input),

    onMutate: async input => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.settings() })
      const previous = queryClient.getQueryData<Resp<NotificationSettings>>(
        notificationKeys.settings()
      )
      queryClient.setQueryData<Resp<NotificationSettings>>(notificationKeys.settings(), old =>
        old ? { ...old, data: { ...old.data, ...input } } : old
      )
      return { previous }
    },

    onSuccess: response => {
      queryClient.setQueryData(notificationKeys.settings(), response)
    },

    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.settings(), context.previous)
      }
    }
  })
}

export function useRemoveDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsService.removeDevice(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.devices() })
  })
}

export function useSendTestNotification() {
  return useMutation({
    mutationFn: (input: { title: string; body: string }) => notificationsService.sendTest(input)
  })
}
