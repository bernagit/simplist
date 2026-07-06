'use client'

import { usePathname } from 'next/navigation'
import { Spotlight, SpotlightActionData } from '@mantine/spotlight'
import { useState } from 'react'
import { ModalsProvider } from '@mantine/modals'
import { Box } from '@mantine/core'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileOverlay } from './MobileOverlay'
import { HotkeyProvider } from '@/providers/HotKeysProvider'
import { SidebarProvider } from '@/providers/SidebarProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { TopbarProvider } from '@/providers/TopbarProvider'
import AddList from '../modals/AddList'
import ShareList from '../modals/ShareList'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // const [query, setQuery] = useState<string>("");
  // const [debouncedQuery] = useDebouncedValue(query, 200);
  const [actions, setActions] = useState<SpotlightActionData[]>([])
  const pathname = usePathname()

  const skipLayout = pathname.startsWith('/login') || pathname.startsWith('/profile')

  if (skipLayout) return <>{children}</>

  return (
    <QueryProvider>
      <HotkeyProvider>
        <ModalsProvider
          modals={{
            addList: AddList,
            shareList: ShareList
          }}
          modalProps={{
            withinPortal: true,
            zIndex: 400,
            closeOnClickOutside: false
          }}
        >
          <TopbarProvider>
            <SidebarProvider>
              <Spotlight
                actions={actions}
                // onQueryChange={setQuery}
                onSpotlightClose={() => setActions([])}
              />

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
              </Box>
            </SidebarProvider>
          </TopbarProvider>
        </ModalsProvider>
      </HotkeyProvider>
    </QueryProvider>
  )
}
