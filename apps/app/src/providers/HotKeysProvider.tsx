'use client'

import { useHotkeys } from '@mantine/hooks'
import { useParams, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { modals } from '@mantine/modals'
import { HOTKEYS } from '@/utils/hotkeys'

export function HotkeyProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const params = useParams()

  useHotkeys([
    [
      HOTKEYS.NEW_LIST.keys,
      () => {
        modals.openContextModal({
          modal: 'addList',
          title: 'Add new list',
          centered: true,
          innerProps: undefined
        })
      }
    ]
  ])

  return <>{children}</>
}
