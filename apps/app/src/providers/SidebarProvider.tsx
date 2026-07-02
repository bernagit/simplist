'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { useMediaQuery } from '@mantine/hooks'

interface SidebarContextType {
  opened: boolean
  toggle: () => void
  open: () => void
  close: () => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)') ?? false

  // Desktop remembers its state
  const [desktopOpened, setDesktopOpened] = useState(true)

  // Mobile starts closed
  const [mobileOpened, setMobileOpened] = useState(false)

  const opened = isMobile ? mobileOpened : desktopOpened

  const toggle = useCallback(() => {
    if (isMobile) {
      setMobileOpened(v => !v)
    } else {
      setDesktopOpened(v => !v)
    }
  }, [isMobile])

  const open = useCallback(() => {
    if (isMobile) {
      setMobileOpened(true)
    } else {
      setDesktopOpened(true)
    }
  }, [isMobile])

  const close = useCallback(() => {
    if (isMobile) {
      setMobileOpened(false)
    } else {
      setDesktopOpened(false)
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider
      value={{
        opened,
        toggle,
        open,
        close,
        isMobile
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)

  if (!ctx) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return ctx
}
