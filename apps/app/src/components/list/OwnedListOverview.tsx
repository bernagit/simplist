'use client'

import { createListModal, shareListModal, updateListModal } from "@/lib/modals/list"
import { OwnedList } from "@/models/lists"
import { useArchiveList, useDeleteList, useLists, useUnarchiveList } from "@/queries/lists"
import { usePreferences } from "@/queries/preferences"
import { contextMenuStyles } from "@/utils/misc"
import { ActionIcon, Badge, Button, Card, Center, Collapse, Container, Divider, Grid, Group, Indicator, Loader, SegmentedControl, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core"
import { useDebouncedValue, useDisclosure, useLocalStorage } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { IconPlus, IconAdjustmentsHorizontal, IconUsers, IconList, IconTrash, IconShare, IconArchiveOff, IconArchive, IconEdit, IconInfoCircle } from "@tabler/icons-react"
import dayjs from "dayjs"
import { useContextMenu } from "mantine-contextmenu"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export default function OwnedListOverview() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300)
  const { showContextMenu } = useContextMenu()

  const { data: lists, isLoading } = useLists()

  const data = useMemo(() => lists?.data.owned ?? [], [lists])

  const archiveList = useArchiveList()
  const unarchiveList = useUnarchiveList()
  const deleteList = useDeleteList()

  const { data: pref } = usePreferences(true)
  const preferences = pref?.data

  const [expanded, { toggle }] = useDisclosure(false)

  type StatusFilter = 'active' | 'all' | 'archived'

  const [status, setStatus] = useLocalStorage<StatusFilter>({
    key: 'list-status-filter',
    defaultValue: 'active'
  })

  const activeFilters = useMemo(() => {
    return status !== 'active'
  }, [status])

  const filteredData = useMemo(() => {
    let lists = [...data]

    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase()

      lists = lists.filter(
        list =>
          list.title.toLowerCase().includes(query) ||
          list.description?.toLowerCase().includes(query)
      )
    }

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

    return lists
  }, [data, debouncedQuery, status])

  const handleListClick = (listId: string) => {
    router.push(`/lists/${listId}`)
  }

  const handleDeleteList = (listId: string) => {
    if (preferences?.confirmDelete) {
      modals.openConfirmModal({
        title: 'Delete List',
        children: (
          <Text size="sm">
            Are you sure you want to delete this list? This action cannot be undone.
          </Text>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          await deleteList.mutateAsync(listId)
        }
      })
    } else {
      deleteList.mutate(listId)
    }
  }

  const getMenuOptions = (list: OwnedList) => {
    return [
      {
        key: 'info',
        icon: <IconInfoCircle size={20} />,
        title: 'More Info',
        onClick: () => {
          modals.open({
            title: 'List Info',
            children: (
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Title:</strong> {list.title}
                </Text>
                <Text size="sm">
                  <strong>Description:</strong> {list.description || 'No description'}
                </Text>
                <Text size="sm">
                  <strong>Created At:</strong> {dayjs(list.createdAt).format('DD MMM YYYY, HH:mm')}
                </Text>
                <Text size="sm">
                  <strong>Updated At:</strong> {dayjs(list.updatedAt).format('DD MMM YYYY, HH:mm')}
                </Text>
                {list.archivedAt && (
                  <Text size="sm">
                    <strong>Archived At:</strong> {dayjs(list.archivedAt).format('DD MMM YYYY, HH:mm')}
                  </Text>
                )}
              </Stack>
            )
          })
        }
      },
      {
        key: 'edit',
        icon: <IconEdit size={20} />,
        title: 'Edit',
        onClick: () => {
          updateListModal(list.id, list)
        }
      },
      {
        key: 'archive',
        icon: list.archivedAt ? <IconArchiveOff size={20} /> : <IconArchive size={20} />,
        title: list.archivedAt ? 'Unarchive' : 'Archive',
        onClick: async () => {
          if (list.archivedAt) {
            await unarchiveList.mutateAsync(list.id)
          } else {
            if (preferences?.confirmDelete) {
              modals.openConfirmModal({
                title: 'Archive List',
                children: (
                  <Stack gap="xs">
                    <Text size="sm">
                      Are you sure you want to archive this list?
                    </Text>
                    <Text size="sm" c="dimmed">
                      If this list is shared, it will be hidden from other users until you unarchive it.
                    </Text>
                  </Stack>
                ),
                labels: { confirm: 'Archive', cancel: 'Cancel' },
                confirmProps: { color: 'orange' },
                onConfirm: async () => {
                  await archiveList.mutateAsync(list.id)
                }
              })
            } else {
              await archiveList.mutateAsync(list.id)
            }
          }
        }
      },
      {
        key: 'share',
        icon: <IconShare size={20} />,
        title: 'Share',
        onClick: () => {
          shareListModal(list.id)
        }
      },
      {
        key: 'divider'
      },
      {
        key: 'delete',
        icon: <IconTrash size={20} />,
        title: 'Delete',
        color: 'red',
        onClick: () => {
          handleDeleteList(list.id)
        }
      }
    ]
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
          <Title order={1}>{'My Lists'}</Title>
          <Text c="dimmed">
            {filteredData.length} {filteredData.length === 1 ? 'list' : 'lists'}
          </Text>
        </div>
        <ActionIcon size="lg" radius="md" variant="filled" onClick={createListModal}>
          <IconPlus size={20} />
        </ActionIcon>
      </Group>
      <Stack mb="md" gap="sm">
        <Group gap="sm" align="center">
          <TextInput
            placeholder="Search lists..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.currentTarget.value)}
            flex={1}
          />
          {activeFilters && !expanded ? (
            <Indicator label="!" color="red" size={16} offset={4}>
              <ActionIcon
                size="lg"
                radius="md"
                variant={expanded ? 'filled' : 'outline'}
                onClick={toggle}
              >
                <IconAdjustmentsHorizontal size={20} />
              </ActionIcon>
            </Indicator>
          ) : (
            <ActionIcon
              size="lg"
              radius="md"
              variant={expanded ? 'filled' : 'outline'}
              onClick={toggle}
            >
              <IconAdjustmentsHorizontal size={20} />
            </ActionIcon>
          )}
        </Group>

        <Collapse expanded={expanded}>
          <Card withBorder radius="md" p="md">
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

              <Group justify="flex-end">
                <Button variant="subtle" size="xs" onClick={() => setStatus('active')}>
                  Reset
                </Button>
              </Group>
            </Stack>
          </Card>
        </Collapse>
      </Stack>
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
              onContextMenu={
                showContextMenu(getMenuOptions(list), {
                  styles: contextMenuStyles
                })
              }
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <ThemeIcon radius="xl" size="lg" color={list.color ?? 'gray'} variant="light">
                    {list.shared ? (
                      <IconUsers size={18} />
                    ) : (
                      <IconList size={18} />
                    )
                    }
                  </ThemeIcon>

                  <Group gap="xs">
                    {list.archivedAt && (
                      <Badge color="gray" variant="light">
                        Archived
                      </Badge>
                    )}

                    <Badge variant="outline">{dayjs(list.updatedAt).format('DD MMM')}</Badge>
                  </Group>
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