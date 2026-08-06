'use client'

import { ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from '@mantine/hooks'
import { useMantineColorScheme } from '@mantine/core'

import { HOTKEYS } from '@/utils/hotkeys'
import { createListModal, shareListModal, updateListModal } from '@/lib/modals/list'
import { useKeySequence } from '@/hooks/useKeySequence'
import { useSidebar } from './SidebarProvider'
import { useHelp } from './HelpProvider'
import { useAppRoute } from '@/hooks/useAppRoute'
import { useQueryClient } from '@tanstack/react-query'
import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { listKeys } from '@/queries/lists'
import { openSettingsModal } from '@/lib/modals/common'

export function HotkeyProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const route = useAppRoute()
  const { toggleColorScheme } = useMantineColorScheme()
  const { toggle: toggleSidebar, isMobile } = useSidebar()
  const { toggle: toggleHelp } = useHelp()
  const queryClient = useQueryClient()

  const handleShareList = useCallback(() => {
    if (route.listId) {
      shareListModal(route.listId)
    }
  }, [route.listId])

  const handleEditList = useCallback(() => {
    if (route.listId) {
      const cachedData = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(route.listId))
      const list = cachedData?.data

      if (!list) return
      updateListModal(route.listId, {
        title: list.title,
        description: list.description,
        color: list.color,
        icon: list.icon
      })
    }
  }, [queryClient, route.listId])

  const handleOpenSettings = useCallback(() => {
    openSettingsModal(isMobile)
  }, [isMobile])

  useHotkeys([
    [HOTKEYS.NEW_LIST.keys[0], createListModal],
    [HOTKEYS.TOGGLE_THEME.keys[0], toggleColorScheme],
    [HOTKEYS.TOGGLE_SIDEBAR.keys[0], toggleSidebar],
    [HOTKEYS.TOGGLE_HELP.keys[0], toggleHelp],
    [HOTKEYS.OPEN_SETTINGS.keys[0], handleOpenSettings],
    [HOTKEYS.SHARE_LIST.keys[0], handleShareList],
    [HOTKEYS.EDIT_LIST.keys[0], handleEditList]
  ])

  useKeySequence(HOTKEYS.GO_HOME.keys, () => router.push('/'))
  useKeySequence(HOTKEYS.GO_CALENDAR.keys, () => router.push('/calendar'))
  useKeySequence(HOTKEYS.GO_LISTS.keys, () => router.push('/lists'))
  useKeySequence(HOTKEYS.GO_SHARED_LISTS.keys, () => router.push('/lists/shared'))

  return children
}
