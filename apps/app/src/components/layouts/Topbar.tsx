'use client'

import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { useSidebar } from '@/providers/SidebarProvider'
import { useTopbar } from '@/providers/TopbarProvider'
import { listKeys, useArchiveList } from '@/queries/lists'
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
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import { MENU_WIDTH } from './Sidebar'
import { shareListModal, updateListModal } from '@/lib/modals/list'

export const TOPBAR_HEIGHT = 50

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function Topbar() {
  const { toggle, opened } = useSidebar()
  const { isMobile } = useSidebar()
  const { breadcrumbs, setBreadcrumbs, showTitle, title, description } = useTopbar()
  const path = usePathname()
  const queryClient = useQueryClient()
  const archiveList = useArchiveList()

  const route = useMemo(() => {
    const segments = path.split('/').filter(Boolean)

    const isLists = segments[0] === 'lists'
    const isShared = isLists && segments[1] === 'shared'

    const listId = isLists ? (isShared ? (segments[2] ?? null) : (segments[1] ?? null)) : null

    return {
      segments,
      isLists,
      isShared,
      listId
    }
  }, [path])

  const localBreadcrumbs = useMemo(() => {
    if (path === '/') return []

    const segments = route.segments

    switch (segments[0]) {
      case 'lists': {
        if (segments.length === 1) {
          return [{ label: 'My Lists', href: '/lists' }]
        }

        if (route.isShared) {
          return [{ label: 'Shared', href: '/lists/shared' }]
        }

        if (route.listId) {
          return [{ label: 'My Lists', href: '/lists' }]
        }

        break
      }

      default:
        return [
          {
            label: capitalize(segments.join(' ')),
            href: path
          }
        ]
    }

    return []
  }, [path, route])

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

  const handleArchive = useCallback(() => {
    if (!route.listId) return

    archiveList.mutate(route.listId)
  }, [archiveList, route.listId])

  const handleShare = useCallback(() => {
    if (!route.listId) return

    shareListModal(route.listId)
  }, [route.listId])

  useEffect(() => {
    setBreadcrumbs(localBreadcrumbs)
  }, [localBreadcrumbs, setBreadcrumbs])

  const canShare = route.listId && !route.isShared

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
                  <Anchor key={index} href={item.href} size="sm" fw={600}>
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
          {canShare && (
            <>
              <Tooltip label="Share list" openDelay={500}>
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
                  <Menu.Item leftSection={<IconArchive size={20} />} onClick={handleArchive}>
                    Archive
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
