'use client'

import { useHotkeys } from '@mantine/hooks'
// import { useParams, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { HOTKEYS } from '@/utils/hotkeys'
import { createListModal } from '@/lib/modals/list'

export function HotkeyProvider({ children }: { children: ReactNode }) {
  // const router = useRouter()
  // const params = useParams()

  useHotkeys([[HOTKEYS.NEW_LIST.keys, () => createListModal()]])

  return <>{children}</>
}
