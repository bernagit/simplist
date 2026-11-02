'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { useMediaQuery, useMounted } from '@mantine/hooks'

/** Small screen: drives layout (overlay sidebar, full-screen modals, …). Matches Mantine's `sm` breakpoint. */
const MOBILE_QUERY = '(max-width: 47.99em)'
/** No hover / coarse pointer: phones and tablets of any size. Drives hover-only UI. */
const TOUCH_QUERY = '(hover: none), (pointer: coarse)'

interface SidebarContextType {
  opened: boolean
  toggle: () => void
  open: () => void
  close: () => void
  /** Screen is smaller than the `sm` breakpoint. Use for layout decisions. */
  isMobile: boolean
  /** Device can't hover (touch). Use instead of `isMobile` for anything revealed on hover. */
  isTouch: boolean
  /**
   * False during SSR and the first client render, when media queries can't be read yet
   * and `isMobile`/`isTouch` are always false.
   */
  isMediaResolved: boolean
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // useMediaQuery reads the query in an effect, so the first render is always `false`.
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const isTouch = useMediaQuery(TOUCH_QUERY)
  const isMediaResolved = useMounted()

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
        isMobile,
        isTouch,
        isMediaResolved
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
