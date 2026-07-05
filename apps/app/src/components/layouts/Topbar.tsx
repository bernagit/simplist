'use client'

import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { useSidebar } from '@/providers/SidebarProvider'
import { useTopbar } from '@/providers/TopbarProvider'
import { listKeys } from '@/queries/lists'
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
  Menu
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconDots, IconEdit, IconLayoutSidebar, IconUserShare } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { MENU_WIDTH } from './Sidebar'

export const TOPBAR_HEIGHT = 50

export function Topbar() {
  const { toggle, opened } = useSidebar()
  const { breadcrumbs, setBreadcrumbs, showTitle, title } = useTopbar()
  const path = usePathname()
  const queryClient = useQueryClient()

  const listId = useMemo(() => {
    const match = path.match(/^\/lists\/([a-zA-Z0-9-]+)$/)
    return match ? match[1] : null
  }, [path])

  const localBreadcrumbs = useMemo(() => {
    if (path === '/') return []

    const listRegex = /^\/lists\/([a-zA-Z0-9-]+)$/

    if (listRegex.test(path)) {
      return [{ label: 'My Lists', href: '/lists' }]
    }

    return [
      {
        label: path.replace('/', ''),
        href: path
      }
    ]
  }, [path])

  const handleEdit = () => {
    if (!listId) return
    const cachedData = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(listId))
    const list = cachedData?.data

    if (!list) return

    modals.openContextModal({
      modal: 'addList',
      title: 'Update list',
      centered: true,
      innerProps: {
        listId: list.id,
        data: {
          title: list.title,
          description: list.description,
          color: list.color,
          icon: list.icon
        }
      }
    })
  }

  const handleShare = () => {
    if (!listId) return

    modals.openContextModal({
      modal: 'shareList',
      title: <Text size='xl' fw={600}>Share list</Text>,
      centered: true,
      innerProps: {
        listId,
      }
    })
  }

  useEffect(() => {
    setBreadcrumbs(localBreadcrumbs)
  }, [localBreadcrumbs, setBreadcrumbs])

  return (
    <Box h={50} style={{ flexShrink: 0 }}>
      <Group h="100%" px="md" justify="space-between">
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
          <Group>
            <Title order={3} mt="md" fw={600} style={{ display: showTitle ? 'block' : 'none' }}>
              {title}
            </Title>
          </Group>
        )}
        <Group gap={'xs'}>
          {listId && (
            <>
              <Tooltip label="Share list" openDelay={500}>
                <Button
                  variant="light"
                  mt="sm"
                  leftSection={<IconUserShare size={16} />}
                  onClick={handleShare}
                >
                  Share
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
                  <Menu.Item leftSection={<IconEdit size={16} />} onClick={handleEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Item>Add Section</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
        </Group>
      </Group>
    </Box>
  )
}
