'use client'

import {
  Stack,
  Text,
  NavLink,
  ScrollArea,
  Box,
  Divider,
  Group,
  Avatar,
  Menu,
  ActionIcon,
  UnstyledButton,
  Tooltip,
  useMantineTheme,
  useComputedColorScheme,
  Popover
} from '@mantine/core'
import {
  IconHome2,
  IconCalendar,
  IconSearch,
  IconSettings,
  IconPlus,
  IconPoint,
  IconChevronDown,
  IconLogout,
  IconLayoutSidebar,
  IconChevronRight,
  IconHelp,
  IconUsers,
  IconKeyboard
} from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { spotlight } from '@mantine/spotlight'
import { useTranslations } from 'next-intl'
import { useMe } from '@/queries/auth'
import { useLists } from '@/queries/lists'
import { useSidebar } from '@/providers/SidebarProvider'
import { createListModal } from '@/lib/modals/list'
import { useLocalStorage } from '@mantine/hooks'
import { useAuth } from '@/providers/AuthProvider'
import { HotkeyBinding } from '../common/KeyBinding'
import { openSettingsModal } from '@/lib/modals/common'
import { useHelp } from '@/providers/HelpProvider'
import { DOCS_URL } from '@/utils/constants'

export const MENU_WIDTH = 290
const MIN_WIDTH = 240
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 280

export function Sidebar() {
  const t = useTranslations('Sidebar')
  const { toggle, opened, isMobile, isTouch, isMediaResolved } = useSidebar()
  // xs (18px) is fine for a mouse, too small to hit reliably with a finger
  const smallIconSize = isTouch ? 'lg' : 'xs'
  const smallIconPx = isTouch ? 18 : 14
  const [ownedListsOpen, setOwnedListsOpen] = useState(true)
  const [sharedListsOpen, setSharedListsOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme()
  const { logout } = useAuth()
  const { toggle: toggleHelp } = useHelp()
  const [sidebarWidth, setSidebarWidth] = useLocalStorage({
    key: 'sidebar-width',
    defaultValue: DEFAULT_WIDTH
  })
  const sidebarRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(sidebarWidth)
  const rafRef = useRef<number | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [isHandleHovered, setIsHandleHovered] = useState(false)

  const moveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null)
  const upHandlerRef = useRef<(() => void) | null>(null)

  const { data: me, isLoading: meLoading } = useMe()
  const { data: lists } = useLists()

  const ownedLists = useMemo(() => {
    return lists?.data.owned.filter(list => !list.archivedAt) || []
  }, [lists])

  const sharedLists = useMemo(() => {
    return lists?.data.shared.filter(list => !list.archivedAt) || []
  }, [lists])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleNavigate = (href: string) => {
    router.push(href)

    if (isMobile) {
      toggle()
    }
  }

  const cleanupResizeListeners = useCallback(() => {
    if (moveHandlerRef.current) {
      window.removeEventListener('mousemove', moveHandlerRef.current)
      moveHandlerRef.current = null
    }
    if (upHandlerRef.current) {
      window.removeEventListener('mouseup', upHandlerRef.current)
      upHandlerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      widthRef.current = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, ev.clientX))

      if (rafRef.current) return

      rafRef.current = requestAnimationFrame(() => {
        sidebarRef.current?.style.setProperty('width', `${widthRef.current}px`)
        rafRef.current = null
      })
    }

    const onUp = () => {
      setIsResizing(false)
      setSidebarWidth(widthRef.current)
      cleanupResizeListeners()
    }

    moveHandlerRef.current = onMove
    upHandlerRef.current = onUp

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleOpenSettings = useCallback(() => {
    openSettingsModal(isMobile)
  }, [isMobile])

  useEffect(() => {
    widthRef.current = sidebarWidth
  }, [sidebarWidth])

  useEffect(() => {
    return () => cleanupResizeListeners()
  }, [cleanupResizeListeners])

  const handleActive = isResizing || isHandleHovered

  // Before media queries resolve (SSR + first render) we render the desktop sidebar,
  // so hide it with CSS on small screens to avoid a flash of it on phones.
  const hideUntilResolved = isMediaResolved ? {} : { visibleFrom: 'sm' as const }

  if (!opened) return null

  return (
    <>
      <Box
        {...hideUntilResolved}
        w={isMobile ? DEFAULT_WIDTH : sidebarWidth}
        ref={sidebarRef}
        h={isMobile ? '100dvh' : '100%'}
        pos={isMobile ? 'fixed' : 'relative'}
        style={{
          top: isMobile ? 0 : undefined,
          left: isMobile ? 0 : undefined,
          zIndex: isMobile ? 300 : undefined,
          flexShrink: 0,
          overflow: 'hidden',
          transition: isResizing ? 'none' : 'width 200ms ease',
          borderRight:
            '2px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))'
        }}
        bg="var(--mantine-color-body)"
      >
        <Stack gap={0} h="100%">
          <Menu shadow="md" width={MENU_WIDTH} position="bottom-start">
            <Menu.Target>
              <Group gap="sm" wrap="nowrap" ml={0} m={4}>
                <UnstyledButton
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderRadius: 'var(--mantine-radius-md)'
                  }}
                >
                  <Group gap="sm" wrap="nowrap" px="xs" py="xs">
                    <Avatar radius="xl" color={theme.primaryColor} src={me?.avatar ?? null}>
                      {!me?.avatar && me?.initials}
                    </Avatar>

                    <Box flex={1} miw={0}>
                      <Text size="sm" fw={500} truncate={'end'}>
                        {meLoading ? t('loading') : me?.name}
                      </Text>

                      <Text size="xs" c="dimmed" truncate={'end'}>
                        {me?.email}
                      </Text>
                    </Box>

                    <IconChevronDown size={14} />
                  </Group>
                </UnstyledButton>
                {opened && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="md"
                    onClick={toggle}
                    aria-label={t('toggleSidebar')}
                    mr="xs"
                  >
                    <IconLayoutSidebar size={18} />
                  </ActionIcon>
                )}
              </Group>
            </Menu.Target>
            <Menu.Dropdown style={{ zIndex: 400 }}>
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                rightSection={<HotkeyBinding hotkey='OPEN_SETTINGS'></HotkeyBinding>}
                onClick={() => handleOpenSettings()}
              >
                {t('settings')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                {t('logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <ScrollArea flex={1} scrollbarSize={4} type="hover">
            <Stack gap={2} p="xs">
              <NavLink
                label={t('home')}
                leftSection={<IconHome2 size={18} />}
                active={pathname === '/'}
                onClick={() => handleNavigate('/')}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />
              <NavLink
                label={t('calendar')}
                leftSection={<IconCalendar size={18} />}
                active={pathname === '/calendar'}
                onClick={() => handleNavigate('/calendar')}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />
              <NavLink
                label={t('search')}
                leftSection={<IconSearch size={18} />}
                active={pathname === '/search'}
                onClick={() => spotlight.open()}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />

              <Divider my="xs" />

              <NavLink
                label={
                  <Group justify="space-between" align="center" style={{ width: '100%' }}>
                    <Text
                      size="xs"
                      fw={600}
                      tt="uppercase"
                      c="dimmed"
                      style={{ letterSpacing: '0.06em' }}
                    >
                      {t('myLists')}
                    </Text>
                    <Tooltip label={t('addList')} position="right" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size={smallIconSize}
                        onClick={e => {
                          createListModal()
                          e.stopPropagation()
                        }}
                        aria-label={t('addList')}
                      >
                        <IconPlus size={smallIconPx} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                }
                rightSection={
                  <Group wrap="nowrap" gap={4} flex={1}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size={smallIconSize}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        setOwnedListsOpen(o => !o)
                      }}
                      aria-label={ownedListsOpen ? t('collapseLists') : t('expandLists')}
                    >
                      <IconChevronRight size={smallIconPx} />
                    </ActionIcon>
                  </Group>
                }
                opened={ownedListsOpen}
                onClick={e => {
                  handleNavigate('/lists')
                  e.stopPropagation()
                }}
                active={pathname === '/lists'}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              >
                {ownedLists.map(list => {
                  return (
                    <NavLink
                      key={list.id}
                      label={list.title}
                      leftSection={
                        <IconPoint
                          size={24}
                          color={list.color ? `${list.color}` : 'var(--mantine-color-gray-6)'}
                          fill={list.color ? `${list.color}` : 'var(--mantine-color-gray-6)'}
                        />
                      }
                      rightSection={
                        list.shared ? (
                          <Tooltip label={t('listIsShared')} position="right" withArrow>
                            <IconUsers size={16} />
                          </Tooltip>
                        ) : null
                      }
                      active={pathname === `/lists/${list.id}`}
                      onClick={() => handleNavigate(`/lists/${list.id}`)}
                      style={{ borderRadius: 'var(--mantine-radius-md)' }}
                    />
                  )
                })}
              </NavLink>
              <Divider my="xs" />
              <NavLink
                label={
                  <Text
                    size="xs"
                    fw={600}
                    tt="uppercase"
                    c="dimmed"
                    style={{ letterSpacing: '0.06em' }}
                  >
                    {t('sharedWithMe')}
                  </Text>
                }
                rightSection={
                  <Group wrap="nowrap" gap={4} flex={1}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size={smallIconSize}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSharedListsOpen(o => !o)
                      }}
                      aria-label={sharedListsOpen ? t('collapseLists') : t('expandLists')}
                    >
                      <IconChevronRight size={smallIconPx} />
                    </ActionIcon>
                  </Group>
                }
                opened={sharedListsOpen}
                onClick={e => {
                  handleNavigate(`/lists/shared`)
                  e.stopPropagation()
                }}
                active={pathname === '/lists/shared'}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              >
                {sharedLists.map(list => (
                  <NavLink
                    key={list.id}
                    label={list.title}
                    leftSection={
                      <IconPoint
                        size={18}
                        color={list.color ? `${list.color}` : 'var(--mantine-color-gray-6)'}
                        fill={list.color ? `${list.color}` : 'var(--mantine-color-gray-6)'}
                      />
                    }
                    active={pathname === `/lists/shared/${list.id}`}
                    onClick={() => handleNavigate(`/lists/shared/${list.id}`)}
                    style={{ borderRadius: 'var(--mantine-radius-md)' }}
                  />
                ))}
              </NavLink>
            </Stack>
          </ScrollArea>

          <Box p="xs">
            <Divider mb="xs" />
            <Popover width={MENU_WIDTH} position="top-start" shadow="md">
              <Popover.Target>
                <NavLink
                  label={t('helpAndSupport')}
                  leftSection={<IconHelp size={18} />}
                  style={{ borderRadius: 'var(--mantine-radius-md)' }}
                />
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={4}>
                  <NavLink
                    label={t('documentation')}
                    leftSection={<IconHelp size={18} />}
                    onClick={() => window.open(DOCS_URL, '_blank')}
                    style={{ borderRadius: 'var(--mantine-radius-md)' }}
                  />
                  {/* Shortcuts are only useful with a keyboard */}
                  {!isTouch && (
                    <NavLink
                      label={t('keyboardShortcuts')}
                      leftSection={<IconKeyboard size={18} />}
                      onClick={() => toggleHelp()}
                      style={{ borderRadius: 'var(--mantine-radius-md)' }}
                    />
                  )}
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Box>
        </Stack>
      </Box>

      {!isMobile && (
        <Box
          {...hideUntilResolved}
          onMouseDown={startResize}
          onMouseEnter={() => setIsHandleHovered(true)}
          onMouseLeave={() => setIsHandleHovered(false)}
          role="separator"
          aria-orientation="vertical"
          aria-label={t('resizeSidebar')}
          pos="relative"
          w={10}
          style={{
            flexShrink: 0,
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            margin: 0,
          }}
        >
          <Box
            style={{
              width: 2,
              height: '100%',
              borderRadius: 999,
              backgroundColor: handleActive
                ? theme.colors[theme.primaryColor]![colorScheme === 'dark' ? 5 : 6]
                : 'transparent',
              transition: isResizing ? 'none' : 'background-color 120ms ease'
            }}
            ml={-9}
            mr={0}
            p={0}
          />
        </Box>
      )}
    </>
  )
}