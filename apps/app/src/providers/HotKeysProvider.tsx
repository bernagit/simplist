'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from '@mantine/hooks'
import { useMantineColorScheme } from '@mantine/core'

import { HOTKEYS } from '@/utils/hotkeys'
import { createListModal } from '@/lib/modals/list'
import { useKeySequence } from '@/hooks/use-key-sequence'
import { useSidebar } from './SidebarProvider'
import { useHelp } from './HelpProvider'

export function HotkeyProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { toggleColorScheme } = useMantineColorScheme()
  const { toggle: toggleSidebar } = useSidebar()
  const { toggle: toggleHelp } = useHelp()

  useHotkeys([
    [HOTKEYS.NEW_LIST.keys[0], createListModal],
    [HOTKEYS.TOGGLE_THEME.keys[0], toggleColorScheme],
    [HOTKEYS.TOGGLE_SIDEBAR.keys[0], toggleSidebar],
    [HOTKEYS.TOGGLE_HELP.keys[0], toggleHelp],
  ])

  useKeySequence(HOTKEYS.GO_HOME.keys, () => router.push('/'))
  useKeySequence(HOTKEYS.GO_CALENDAR.keys, () => router.push('/calendar'))
  useKeySequence(HOTKEYS.GO_LISTS.keys, () => router.push('/lists'))
  useKeySequence(HOTKEYS.GO_SHARED_LISTS.keys, () => router.push('/lists/shared'))

  return children
}