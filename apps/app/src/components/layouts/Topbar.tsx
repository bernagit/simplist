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
  Stack,
  useComputedColorScheme
} from '@mantine/core'
import {
  IconArchive,
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
import { shareListModal, updateListModal } from '@/lib/modals/list'
import { useAppRoute } from '@/hooks/useAppRoute'
import ConfirmArchive from '../modals/ConfirmArchive'
import { modals } from '@mantine/modals'
import { usePreferences } from '@/queries/preferences'
import { HotkeyBinding } from '../common/KeyBinding'

export const TOPBAR_HEIGHT = 60

export function Topbar() {
  const t = useTranslations('Topbar')
  const router = useRouter()
  const { toggle, opened } = useSidebar()
  const { isMobile } = useSidebar()
  const { breadcrumbs, setBreadcrumbs, showTitle, title, description } = useTopbar()
  const queryClient = useQueryClient()
  const archiveList = useArchiveList()
  const unarchiveList = useUnarchiveList()
  const { data: pref } = usePreferences(true)
  const preferences = pref?.data
  const colorScheme = useComputedColorScheme()

  const route = useAppRoute()

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

    return list.archivedAt === null ? false : true
  }, [route.listId, queryClient])

  const handleToggleArchive = useCallback(async () => {
    if (!route.listId) return

    if (isArchived) {
      await unarchiveList.mutateAsync(route.listId)
    } else {
      if (preferences?.confirmDelete) {
        modals.openConfirmModal({
          title: t('archiveModalTitle'),
          children: (
            <ConfirmArchive />
          ),
          labels: { confirm: t('archiveConfirm'), cancel: t('cancel') },
          confirmProps: { color: 'orange' },
          onConfirm: async () => {
            if (!route.listId) return
            await archiveList.mutateAsync(route.listId)
          }
        })
      } else {
        await archiveList.mutateAsync(route.listId)
      }
    }
  }, [route.listId, isArchived, unarchiveList, preferences?.confirmDelete, archiveList, t])

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
        borderBottom: `1px solid ${colorScheme === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group>
          {!opened && (
            <ActionIcon
              mt="sm"
              variant="subtle"
              color="gray"
              size="md"
              onClick={toggle}
              aria-label={t('toggleSidebar')}
            >
              <IconLayoutSidebar size={18} />
            </ActionIcon>
          )}

          {breadcrumbs.length > 0 && (
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
          <Stack gap={0} align="center">
            <Title
              order={3}
              mt={'sm'}
              fw={600}
              style={{
                display: showTitle ? 'block' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? 150 : 300
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
                  maxWidth: isMobile ? 150 : 300
                }}
              >
                {description}
              </Text>
            )}
          </Stack>
        )}
        <Group gap={'xs'}>
          {route.canShare && (
            <>
              <Tooltip label={t('shareList')} openDelay={300}>
                <Button variant="light" mt="sm" onClick={handleShare}>
                  <Group>
                    <IconUserShare size={16} />
                    {isMobile ? null : t('share')}
                  </Group>
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
                    rightSection={<HotkeyBinding hotkey='EDIT_LIST'></HotkeyBinding>}
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