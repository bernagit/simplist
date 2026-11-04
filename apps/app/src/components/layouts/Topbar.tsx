'use client'

import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { useSidebar } from '@/providers/SidebarProvider'
import { useTopbar } from '@/providers/TopbarProvider'
import { listKeys, useArchiveList, useUnarchiveList } from '@/queries/lists'
import {
  Group,
  ActionIcon,
  Box,
  Breadcrumbs,
  Anchor,
  Text,
  Title,
  Button,
  Tooltip,
  Menu,
  Stack
} from '@mantine/core'
import {
  IconArchive,
  IconDoorExit,
  IconDots,
  IconEdit,
  IconLayoutSidebar,
  IconUserShare
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { MENU_WIDTH } from './Sidebar'
import { confirmArchiveModal, shareListModal, updateListModal } from '@/lib/modals/list'
import { useAppRoute } from '@/hooks/useAppRoute'
import { usePreferences } from '@/queries/preferences'
import { HotkeyBinding } from '../common/KeyBinding'
import { useLeaveListAction } from '@/hooks/useLeaveListAction'
import { OnboardingTour } from '@gfazioli/mantine-onboarding-tour'
import { TOUR_TARGETS } from '../onboarding/tourTargets'

export const TOPBAR_HEIGHT = 60

export function Topbar() {
  const t = useTranslations('Topbar')
  const router = useRouter()
  const { toggle, opened, isMobile, isMediaResolved } = useSidebar()
  // Until media queries resolve `opened` is the desktop state (open): the toggle would appear
  // only later on phones. Show it there with CSS from the first paint instead.
  const showToggle = !opened || !isMediaResolved
  const toggleUntilResolved = !opened ? {} : { hiddenFrom: 'sm' as const }
  const { breadcrumbs, setBreadcrumbs, showTitle, title, description } = useTopbar()
  const queryClient = useQueryClient()
  const archiveList = useArchiveList()
  const unarchiveList = useUnarchiveList()
  const { data: pref } = usePreferences(true)
  const preferences = pref?.data

  const route = useAppRoute()
  const leaveList = useLeaveListAction()

  const handleLeave = useCallback(() => {
    if (!route.listId) return
    const list = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(route.listId))?.data
    if (list) leaveList({ id: list.id, title: list.title })
  }, [route.listId, queryClient, leaveList])

  const handleEdit = useCallback(() => {
    if (!route.listId) return
    const cachedData = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(route.listId))
    const list = cachedData?.data

    if (!list) return

    updateListModal(list.id, {
      title: list.title,
      description: list.description,
      color: list.color,
      icon: list.icon
    })
  }, [route.listId, queryClient])

  const isArchived = useMemo(() => {
    if (!route.listId) return false

    const cachedData = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(route.listId))
    const list = cachedData?.data

    if (!list) return false

    return list.archivedAt !== null
  }, [route.listId, queryClient])

  const handleToggleArchive = useCallback(async () => {
    if (!route.listId) return

    if (isArchived) {
      await unarchiveList.mutateAsync(route.listId)
    } else {
      if (preferences?.confirmDelete) {
        confirmArchiveModal(async () => {
          if (!route.listId) return
          await archiveList.mutateAsync(route.listId)
        })
      } else {
        await archiveList.mutateAsync(route.listId)
      }
    }
  }, [route.listId, isArchived, unarchiveList, preferences?.confirmDelete, archiveList])

  const handleShare = useCallback(() => {
    if (!route.listId) return

    shareListModal(route.listId)
  }, [route.listId])

  useEffect(() => {
    setBreadcrumbs(route.breadcrumbs)
  }, [route.breadcrumbs, setBreadcrumbs])

  return (
    <Box
      h={TOPBAR_HEIGHT}
      pb={'sm'}
      style={{
        flexShrink: 0,
        borderBottom: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-6))'
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap" gap="xs">
        <Group wrap="nowrap" gap="xs" style={{ flexShrink: 0 }}>
          {showToggle && (
            // Phones: the tour points here (the sidebar, with lists and settings, is behind it)
            <OnboardingTour.Target id={TOUR_TARGETS.menu}>
              <ActionIcon
                {...toggleUntilResolved}
                mt="sm"
                variant="subtle"
                color="gray"
                size="md"
                onClick={toggle}
                aria-label={t('toggleSidebar')}
              >
                <IconLayoutSidebar size={18} />
              </ActionIcon>
            </OnboardingTour.Target>
          )}

          {/* On phones the scrolled-in title replaces the breadcrumbs: both don't fit */}
          {breadcrumbs.length > 0 && !(isMobile && showTitle) && (
            <Breadcrumbs mt="md" separator=">">
              {breadcrumbs.map((item, index) =>
                item.href ? (
                  <Anchor key={index} onClick={() => router.push(item.href!)} size="sm" fw={600}>
                    {item.label}
                  </Anchor>
                ) : (
                  <Text key={index} size="md" c="dimmed" fw={600}>
                    {item.label}
                  </Text>
                )
              )}
            </Breadcrumbs>
          )}
        </Group>

        {showTitle && (
          <Stack gap={0} align="center" style={{ flex: isMobile ? 1 : undefined, minWidth: 0 }}>
            <Title
              order={3}
              mt={'sm'}
              fw={600}
              style={{
                display: showTitle ? 'block' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '100%' : 300
              }}
            >
              {title}
            </Title>
            {description && (
              <Text
                size="sm"
                c="dimmed"
                style={{
                  display: showTitle ? 'block' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? '100%' : 300
                }}
              >
                {description}
              </Text>
            )}
          </Stack>
        )}
        <Group gap={'xs'} wrap="nowrap" style={{ flexShrink: 0 }}>
          {/* A list shared with me: its only action is leaving it */}
          {route.isShared && route.listId && (
            <Menu shadow="md" width={MENU_WIDTH} position="bottom-end">
              <Menu.Target>
                <Tooltip label={t('options')} openDelay={500}>
                  <ActionIcon variant="light" mt="sm" size="lg" aria-label={t('options')}>
                    <IconDots size={16} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" leftSection={<IconDoorExit size={20} />} onClick={handleLeave}>
                  {t('leave')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          {route.canShare && (
            <>
              {/* Both variants are rendered and CSS picks one (same breakpoint as isMobile):
                  isMobile is false until media queries resolve, which flashed the label on phones */}
              <ActionIcon
                hiddenFrom="sm"
                variant="light"
                mt="sm"
                size="lg"
                onClick={handleShare}
                aria-label={t('shareList')}
              >
                <IconUserShare size={16} />
              </ActionIcon>
              <Tooltip label={t('shareList')} openDelay={300}>
                <Button
                  visibleFrom="sm"
                  variant="light"
                  mt="sm"
                  leftSection={<IconUserShare size={16} />}
                  onClick={handleShare}
                >
                  {t('share')}
                </Button>
              </Tooltip>
              <Menu shadow="md" width={MENU_WIDTH} position="bottom-end">
                <Menu.Target>
                  <Tooltip label={t('options')} openDelay={500}>
                    <ActionIcon variant="light" mt="sm" size="lg">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit size={20} />}
                    rightSection={<HotkeyBinding hotkey="EDIT_LIST" />}
                    onClick={handleEdit}
                  >
                    {t('edit')}
                  </Menu.Item>
                  <Menu.Item leftSection={<IconArchive size={20} />} onClick={handleToggleArchive}>
                    {isArchived ? t('unarchive') : t('archive')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
        </Group>
      </Group>
    </Box>
  )
}