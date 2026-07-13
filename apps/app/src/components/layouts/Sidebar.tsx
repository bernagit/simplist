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
  useComputedColorScheme
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
  IconUserCircle,
  IconLayoutSidebar,
  IconChevronRight,
  IconHelp
} from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { spotlight } from '@mantine/spotlight'
import { useMe } from '@/queries/auth'
import { useLists } from '@/queries/lists'
import { useSidebar } from '@/providers/SidebarProvider'
import { authService } from '@/services/auth'
import { createListModal } from '@/lib/modals/list'

export const MENU_WIDTH = 290
const SIDEBAR_WIDTH = 280
const MY_LISTS_TEXT = 'My Lists'
const SHARED_LISTS_TEXT = 'Shared Lists'

export function Sidebar() {
  const { toggle, opened, isMobile } = useSidebar()
  const [ownedListsOpen, setOwnedListsOpen] = useState(true)
  const [sharedListsOpen, setSharedListsOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme()

  const { data: me, isLoading: meLoading } = useMe()
  const { data: lists } = useLists()

  // apply filter on owned lists removing archived lists
  const ownedLists = useMemo(() => {
    return lists?.data.owned.filter(list => !list.archivedAt) || []
  }, [lists])

  const sharedLists = useMemo(() => {
    return lists?.data.shared.filter(list => !list.archivedAt) || []
  }, [lists])

  const handleLogout = async () => {
    await authService.logout()
    router.push('/login')
  }

  const handleNavigate = (href: string) => {
    router.push(href)

    if (isMobile) {
      toggle()
    }
  }

  if (!opened) return null

  return (
    <Box
      w={SIDEBAR_WIDTH}
      h={isMobile ? '100dvh' : '100%'}
      pos={isMobile ? 'fixed' : 'relative'}
      style={{
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 300 : undefined,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 200ms ease',
        borderRight: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`
      }}
      bg="var(--mantine-color-body)"
    >
      <Stack gap={0} h="100%">
        <Menu shadow="md" width={MENU_WIDTH} position="bottom-start">
          <Menu.Target>
            <Group gap="sm" wrap="nowrap" ml={0} m={4}>
              <UnstyledButton
                style={{
                  width: '100%',
                  borderRadius: 'var(--mantine-radius-md)'
                }}
              >
                <Group gap="sm" wrap="nowrap" px="xs" py="xs">
                  <Avatar radius="xl" color={theme.primaryColor}>
                    {me?.initials}
                  </Avatar>

                  <Box>
                    <Text size="sm" fw={500} truncate>
                      {meLoading ? 'Loading...' : me?.name}
                    </Text>

                    <Text size="xs" c="dimmed" truncate>
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
                  aria-label="Toggle sidebar"
                  mr="xs"
                >
                  <IconLayoutSidebar size={18} />
                </ActionIcon>
              )}
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconUserCircle size={16} />}
              onClick={() => handleNavigate('/profile')}
            >
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={16} />}
              onClick={() => handleNavigate('/settings')}
            >
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
              Log out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* Nav */}
        <ScrollArea flex={1} scrollbarSize={4} type="hover">
          <Stack gap={2} p="xs">
            <NavLink
              label="Home"
              leftSection={<IconHome2 size={18} />}
              active={pathname === '/'}
              onClick={() => handleNavigate('/')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
            <NavLink
              label="Calendar"
              leftSection={<IconCalendar size={18} />}
              active={pathname === '/calendar'}
              onClick={() => handleNavigate('/calendar')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
            <NavLink
              label="Search"
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
                    {MY_LISTS_TEXT}
                  </Text>
                  <Tooltip label="Add list" position="right" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="xs"
                      onClick={e => {
                        createListModal()
                        e.stopPropagation()
                      }}
                      aria-label="Add list"
                    >
                      <IconPlus size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              }
              rightSection={
                <Group wrap="nowrap" gap={4} flex={1}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      setOwnedListsOpen(o => !o)
                    }}
                    aria-label={ownedListsOpen ? 'Collapse lists' : 'Expand lists'}
                  >
                    <IconChevronRight size={14} />
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
              {ownedLists.map(list => (
                <NavLink
                  key={list.id}
                  label={list.title}
                  color={list.color ? `${list.color}` : 'gray'}
                  leftSection={
                    <IconPoint
                      size={18}
                      color={list.color ? `${list.color}` : 'var(--mantine-color-gray-6)'}
                      fill={list.color ? `${list.color}` : 'var(--mantine-color-gray-6)'}
                    />
                  }
                  active={pathname === `/lists/${list.id}`}
                  onClick={() => handleNavigate(`/lists/${list.id}`)}
                  style={{ borderRadius: 'var(--mantine-radius-md)' }}
                />
              ))}
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
                  {SHARED_LISTS_TEXT}
                </Text>
              }
              rightSection={
                <Group wrap="nowrap" gap={4} flex={1}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSharedListsOpen(o => !o)
                    }}
                    aria-label={sharedListsOpen ? 'Collapse lists' : 'Expand lists'}
                  >
                    <IconChevronRight size={14} />
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
                  color={list.color ? `${list.color}` : 'gray'}
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

        {/* Bottom */}
        <Box p="xs">
          <Divider mb="xs" />
          <NavLink
            label="Help & Support"
            leftSection={<IconHelp size={18} />}
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          />
        </Box>
      </Stack>
    </Box>
  )
}
