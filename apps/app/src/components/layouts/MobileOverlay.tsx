'use client'

import { useSidebar } from '@/providers/SidebarProvider'
import { Overlay } from '@mantine/core'
import { useCloseOnBack } from '@/hooks/useCloseOnBack'

export function MobileOverlay() {
  const { opened, isMobile, close } = useSidebar()
  // The mobile sidebar is an overlay too: "back" closes it instead of leaving the page
  useCloseOnBack(isMobile && opened, close)

  if (!isMobile || !opened) return null

  return <Overlay pos="fixed" zIndex={250} onClick={close} backgroundOpacity={0.5} />
}
