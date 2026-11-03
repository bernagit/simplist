'use client'

import { usePathname } from 'next/navigation'
import { ModalsProvider } from '@mantine/modals'
import { Box, Button, Group, Modal, ScrollArea } from '@mantine/core'
import { useLocale, useTranslations } from 'next-intl'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileOverlay } from './MobileOverlay'
import { HotkeyProvider } from '@/providers/HotKeysProvider'
import { MOBILE_QUERY, SidebarProvider } from '@/providers/SidebarProvider'
import { TopbarProvider } from '@/providers/TopbarProvider'
import AddList from '../modals/AddList'
import ShareList from '../modals/ShareList'
import { SpotlightProvider } from '@/providers/SpotlightProvider'
import HelpDrawer from './HelpDrawer'
import { HelpProvider } from '@/providers/HelpProvider'
import { PUBLIC_ROUTES } from '@/utils/constants'
import AuthLayout from '../auth/AuthLayout'
import UserSettings from '../modals/UserSettings'
import EditTask from '../modals/EditTask'
import { useChangelog } from '@/hooks/useChangelog'
import { ChangelogView } from '../common/ChangelogView'
import { useState } from 'react'
import { DatesProvider } from '@mantine/dates'
import ConfirmArchive from '../modals/ConfirmArchive'
import { ModalsBackHandler } from '../modals/ModalsBackHandler'
import { useMediaQuery } from '@mantine/hooks'
import { useCloseOnBack } from '@/hooks/useCloseOnBack'
import { PushSync } from '../PushSync'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('AppLayout')
  const { currentVersion, lastSeenVersion, rawChangelog, markAsRead } = useChangelog()

  const [manualOpen, setManualOpen] = useState(false)
  // AppLayout renders the providers, so it can't use useSidebar(): read the breakpoint here.
  const isMobile = useMediaQuery(MOBILE_QUERY)

  // Automatically check if version has changed once client storage is resolved
  const isNewVersion = !!lastSeenVersion && lastSeenVersion !== currentVersion
  const isModalOpen = manualOpen || isNewVersion

  const handleClose = () => {
    markAsRead()
    setManualOpen(false)
  }
  const isAuthRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  useCloseOnBack(isModalOpen && !isAuthRoute, handleClose)

  if (isAuthRoute) return <AuthLayout>{children}</AuthLayout>

  return (
    <DatesProvider
      settings={{
        locale,
        firstDayOfWeek: locale === 'en' ? 0 : 1 // 0 = Sunday (US), 1 = Monday (EU/IT)
      }}
    >
      <ModalsProvider
        modals={{
          addList: AddList,
          shareList: ShareList,
          userSettings: UserSettings,
          editTask: EditTask,
          confirmArchive: ConfirmArchive
        }}
        modalProps={{
          withinPortal: true,
          zIndex: 400,
          closeOnClickOutside: false,
          // Full screen on phones. Short confirmations opt out with `fullScreen: false`.
          fullScreen: isMobile
        }}
      >
        <ModalsBackHandler />
        <PushSync />
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
                          opened={isModalOpen}
                          onClose={handleClose}
                          title={t('whatsNewTitle', { version: currentVersion })}
                          size="lg"
                          fullScreen={isMobile}
                        >
                          <ScrollArea
                            h={isMobile ? 'calc(100dvh - 150px)' : 'min(350px, 55dvh)'}
                            offsetScrollbars
                            p="xs"
                          >
                            <ChangelogView rawMarkdown={rawChangelog} />
                          </ScrollArea>
                          <Group justify="right" mt="md">
                            <Button onClick={markAsRead}>{t('gotItButton')}</Button>
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
    </DatesProvider>
  )
}