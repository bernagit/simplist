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
  IconDots,
  IconEdit,
  IconLayoutSidebar,
  IconUserShare
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import { MENU_WIDTH } from './Sidebar'
import { shareListModal, updateListModal } from '@/lib/modals/list'
import { useAppRoute } from '@/hooks/use-app-route'

export const TOPBAR_HEIGHT = 50

export function Topbar() {
  const router = useRouter()
  const { toggle, opened } = useSidebar()
  const { isMobile } = useSidebar()
  const { breadcrumbs, setBreadcrumbs, showTitle, title, description } = useTopbar()
  const queryClient = useQueryClient()
  const archiveList = useArchiveList()
  const unarchiveList = useUnarchiveList()

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

  const handleToggleArchive = useCallback(() => {
    if (!route.listId) return

    if (isArchived) {
      unarchiveList.mutate(route.listId)
    } else {
      archiveList.mutate(route.listId)
    }
  }, [archiveList, unarchiveList, route.listId, isArchived])

  const handleShare = useCallback(() => {
    if (!route.listId) return

    shareListModal(route.listId)
  }, [route.listId])

  useEffect(() => {
    setBreadcrumbs(route.breadcrumbs)
  }, [route.breadcrumbs, setBreadcrumbs])

  return (
    <Box h={50} style={{ flexShrink: 0 }}>
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group>
          {!opened && (
            <ActionIcon
              mt="sm"
              variant="subtle"
              color="gray"
              size="md"
              onClick={toggle}
              aria-label="Toggle sidebar"
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
              mt="md"
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
              <Tooltip label="Share list" openDelay={300}>
                <Button variant="light" mt="sm" onClick={handleShare}>
                  <Group>
                    <IconUserShare size={16} />
                    {isMobile ? null : 'Share'}
                  </Group>
                </Button>
              </Tooltip>
              <Menu shadow="md" width={MENU_WIDTH} position="bottom-end">
                <Menu.Target>
                  <Tooltip label="Options" openDelay={500}>
                    <ActionIcon variant="light" mt="sm" size="lg">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEdit size={20} />} onClick={handleEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Item leftSection={<IconArchive size={20} />} onClick={handleToggleArchive}>
                    {isArchived ? 'Unarchive' : 'Archive'}
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
