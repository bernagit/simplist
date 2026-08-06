'use client'

import { usePathname } from 'next/navigation'
import { ModalsProvider } from '@mantine/modals'
import { Box, Button, Group, Modal, ScrollArea } from '@mantine/core'
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
import EditTask from '../modals/EditTask'
import { useChangelog } from '@/hooks/useChangelog'
import { ChangelogView } from '../common/ChangelogView'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen, currentVersion, rawChangelog, markAsRead } = useChangelog();

  const isAuthRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (isAuthRoute) return <AuthLayout>{children}</AuthLayout>

  return (
    <ModalsProvider
      modals={{
        addList: AddList,
        shareList: ShareList,
        userSettings: UserSettings,
        editTask: EditTask
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
                    id="app-scroll-container"
                    component="main"
                    flex={1}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      minHeight: 0,
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    <Box
                      w={{ base: '100%', lg: '60%' }}
                      p="md"
                      style={{
                        flex: 1,
                        minHeight: '100%'
                      }}
                    >
                      {children}
                      <Modal
                        opened={isOpen}
                        onClose={markAsRead}
                        title={`What's New in v${currentVersion}`}
                        size="lg"
                      >
                        <ScrollArea h={350} offsetScrollbars p="xs">
                          <ChangelogView rawMarkdown={rawChangelog} />
                        </ScrollArea>
                        <Group justify="right" mt="md">
                          <Button onClick={markAsRead}>Got it!</Button>
                        </Group>
                      </Modal>
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
