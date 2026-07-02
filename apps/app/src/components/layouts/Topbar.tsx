'use client'

import { useSidebar } from '@/providers/SidebarProvider'
import { useTopbar } from '@/providers/TopbarProvider'
import { Group, ActionIcon, Box, Breadcrumbs, Anchor, Text } from '@mantine/core'
import { IconLayoutSidebar } from '@tabler/icons-react'

export function Topbar() {
  const { toggle, opened } = useSidebar()
  const { breadcrumbs } = useTopbar()

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
      </Group>
    </Box>
  )
}
