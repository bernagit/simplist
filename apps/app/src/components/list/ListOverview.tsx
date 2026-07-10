'use client'

import { createListModal } from '@/lib/modals/list'
import { List } from '@/models/lists'
import {
  Center,
  Loader,
  Container,
  Group,
  Title,
  ActionIcon,
  Grid,
  Card,
  Stack,
  ThemeIcon,
  Badge,
  Text,
  TextInput,
  Popover,
  Button,
  Divider,
  SegmentedControl,
  Select
} from '@mantine/core'
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks'
import { IconPlus, IconList, IconAdjustmentsHorizontal } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

type ListOverviewProps = {
  shared: boolean | undefined
  data: List[]
  isLoading: boolean
}

export default function ListOverview({ shared, data, isLoading }: ListOverviewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300)

  type StatusFilter = 'active' | 'all' | 'archived'
  type SortBy = 'updated-desc' | 'created-desc' | 'title-asc'

  const [status, setStatus] = useLocalStorage<StatusFilter>({
    key: 'list-status-filter',
    defaultValue: 'active'
  })

  const [sortBy, setSortBy] = useLocalStorage<SortBy>({
    key: 'list-sort',
    defaultValue: 'updated-desc'
  })

  const filteredData = useMemo(() => {
    let lists = [...data]

    // Search
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase()

      lists = lists.filter(
        list =>
          list.title.toLowerCase().includes(query) ||
          list.description?.toLowerCase().includes(query)
      )
    }

    // Status
    switch (status) {
      case 'active':
        lists = lists.filter(l => l.archivedAt === null)
        break

      case 'archived':
        lists = lists.filter(l => l.archivedAt !== null)
        break

      case 'all':
        break
    }

    // Sort
    switch (sortBy) {
      case 'updated-desc':
        lists.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break

      case 'created-desc':
        lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break

      case 'title-asc':
        lists.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return lists
  }, [data, debouncedQuery, status, sortBy])

  const handleListClick = (listId: string) => {
    const path = shared ? `/lists/shared/${listId}` : `/lists/${listId}`
    router.push(path)
  }

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>My Lists</Title>
          <Text c="dimmed">
            {filteredData.length} {filteredData.length === 1 ? 'list' : 'lists'}
          </Text>
        </div>
        {shared === false && (
          <ActionIcon size="lg" radius="md" variant="filled" onClick={createListModal}>
            <IconPlus size={20} />
          </ActionIcon>
        )}
      </Group>
      <Group mb="md" gap="sm" align="center">
        <TextInput
          placeholder="Search lists..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.currentTarget.value)}
          flex={1}
        />
        <Popover width={300} position="bottom-end" shadow="md" withArrow>
          <Popover.Target>
            <ActionIcon size="lg" radius="md" variant="outline">
              <IconAdjustmentsHorizontal size={20} />
            </ActionIcon>
          </Popover.Target>

          <Popover.Dropdown>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={600} mb={6}>
                  Status
                </Text>

                <SegmentedControl
                  fullWidth
                  value={status}
                  onChange={value => setStatus(value as StatusFilter)}
                  data={[
                    { label: 'Active', value: 'active' },
                    { label: 'All', value: 'all' },
                    { label: 'Archived', value: 'archived' }
                  ]}
                />
              </div>

              <Divider />

              <div>
                <Text size="sm" fw={600} mb={6}>
                  Sort by
                </Text>

                <Select
                  value={sortBy}
                  onChange={value => {
                    console.log('sortBy changed to', value)
                    if (value) setSortBy(value as SortBy)
                  }}
                  comboboxProps={{
                    withinPortal: true
                  }}
                  data={[
                    {
                      value: 'updated-desc',
                      label: 'Recently updated'
                    },
                    {
                      value: 'created-desc',
                      label: 'Recently created'
                    },
                    {
                      value: 'title-asc',
                      label: 'Alphabetical'
                    }
                  ]}
                />
              </div>

              <Divider />

              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    setStatus('active')
                    setSortBy('updated-desc')
                  }}
                >
                  Reset
                </Button>
              </Group>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Group>
      <Grid>
        {filteredData.map(list => (
          <Grid.Col key={list.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              withBorder
              radius="md"
              p="lg"
              h="100%"
              style={{
                cursor: 'pointer',
                transition: '0.15s'
              }}
              onClick={() => handleListClick(list.id)}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <ThemeIcon radius="xl" size="lg" color={list.color ?? 'gray'} variant="light">
                    <IconList size={18} />
                  </ThemeIcon>

                  <Badge variant="outline">{dayjs(list.updatedAt).format('DD MMM')}</Badge>
                </Group>

                <div>
                  <Title order={4}>{list.title}</Title>

                  <Text c="dimmed" size="sm" lineClamp={2} mt={4}>
                    {list.description || 'No description'}
                  </Text>
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  )
}
