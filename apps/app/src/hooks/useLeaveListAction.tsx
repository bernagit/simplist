'use client'

import { useCallback } from 'react'
import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLeaveList } from '@/queries/lists'

/**
 * "Leave list" for a list shared with me: always asks first (getting back in needs a new
 * invitation), then leaves the list page if it is open.
 */
export function useLeaveListAction() {
  const t = useTranslations('LeaveList')
  const router = useRouter()
  const pathname = usePathname()
  const leaveList = useLeaveList()

  return useCallback(
    (list: { id: string; title: string }) => {
      modals.openConfirmModal({
        fullScreen: false,
        title: t('title'),
        children: (
          <Text size="sm">{t.rich('message', { list: list.title, b: chunks => <b>{chunks}</b> })}</Text>
        ),
        labels: { confirm: t('confirm'), cancel: t('cancel') },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          try {
            await leaveList.mutateAsync(list.id)
            if (pathname.startsWith(`/lists/shared/${list.id}`)) router.push('/lists/shared')
            notifications.show({ color: 'teal', message: t('done', { list: list.title }) })
          } catch {
            notifications.show({ color: 'red', title: t('errorTitle'), message: t('errorMessage') })
          }
        }
      })
    },
    [t, router, pathname, leaveList]
  )
}
