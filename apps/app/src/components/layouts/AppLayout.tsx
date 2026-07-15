'use client'

import { usePathname } from 'next/navigation'
import { ModalsProvider } from '@mantine/modals'
import { Box } from '@mantine/core'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileOverlay } from './MobileOverlay'
import { HotkeyProvider } from '@/providers/HotKeysProvider'
import { SidebarProvider } from '@/providers/SidebarProvider'
import { TopbarProvider } from '@/providers/TopbarProvider'
import AddList from '../modals/AddList'
import ShareList from '../modals/ShareList'
import { SpotlightProvider } from '@/providers/SpotlightProvider'
import HelpDrawer from './HelpDrawer'
import { HelpProvider } from '@/providers/HelpProvider'
import { PUBLIC_ROUTES } from '@/proxy'
import AuthLayout from '../auth/AuthLayout'
import UserSettings from '../modals/UserSettings'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (isAuthRoute) return <AuthLayout>{children}</AuthLayout>

  return (
    <ModalsProvider
      modals={{
        addList: AddList,
        shareList: ShareList,
        userSettings: UserSettings
      }}
      modalProps={{
        withinPortal: true,
        zIndex: 400,
        closeOnClickOutside: false
      }}
    >
      <TopbarProvider>
        <SidebarProvider>
          <HelpProvider>
            <HotkeyProvider>
              <SpotlightProvider />
              <Box display="flex" h="100dvh" style={{ overflow: 'hidden' }}>
                <Sidebar />
                <MobileOverlay />
                <Box
                  flex={1}
                  display="flex"
                  style={{
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minWidth: 0
                  }}
                >
                  <Topbar />
                  <Box
                    component="main"
                    flex={1}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <Box w={{ base: '100%', lg: '60%' }} p="md" h="100%">
                      {children}
                    </Box>
                  </Box>
                </Box>
                <HelpDrawer />
              </Box>
            </HotkeyProvider>
          </HelpProvider>
        </SidebarProvider>
      </TopbarProvider>
    </ModalsProvider>
  )
}
