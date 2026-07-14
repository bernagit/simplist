import { useDisclosure } from '@mantine/hooks'
import { createContext, useContext } from 'react'

interface HelpContextType {
  opened: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const HelpContext = createContext<HelpContextType | null>(null)

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, open, close }] = useDisclosure(false)

  return (
    <HelpContext.Provider value={{ opened, toggle, open, close }}>{children}</HelpContext.Provider>
  )
}

export function useHelp() {
  const ctx = useContext(HelpContext)

  if (!ctx) {
    throw new Error('useHelp must be used within a HelpProvider')
  }

  return ctx
}
