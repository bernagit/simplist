'use client'
import { useSidebar } from '@/providers/SidebarProvider'
import { Overlay } from '@mantine/core'

export function MobileOverlay() {
  const { opened, isMobile, close } = useSidebar()

  if (!isMobile || !opened) return null

  return <Overlay pos="fixed" zIndex={250} onClick={close} backgroundOpacity={0.5} />
}
