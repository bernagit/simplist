'use client'

import { ReactNode, useMemo, useState } from 'react'
import {
  ActionIcon,
  Affix,
  Box,
  Button,
  Card,
  Container,
  Group,
  Input,
  Menu,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip
} from '@mantine/core'
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks'
import {
  IconArrowsSort,
  IconCheck,
  IconMoodEmpty,
  IconPlus,
  IconSearch,
  IconSearchOff
} from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { List, ListTaskCounts } from '@/models/lists'
import { HotkeyBinding } from '@/components/common/KeyBinding'
import { HotkeyId } from '@/utils/hotkeys'

export type StatusFilter = 'active' | 'archived' | 'all'
type SortOrder = 'updated' | 'name' | 'created' | 'open'

const SKELETON_CARDS = 6
const GRID_COLS = { base: 1, sm: 2, lg: 3 }
const GRID_SPACING = { base: 'xs', sm: 'md' }

type OverviewList = List & ListTaskCounts

type ListOverviewProps<T extends OverviewList> = {
  title: string
  subtitle: string
  lists: T[]
  loading: boolean
  /** Prefix for the remembered filter and sort (per page) */
  storageKey: string
  /** Archived lists can be shown (owned lists only) */
  withStatusFilter?: boolean
  primaryAction?: { label: string; onClick: () => void; hotkey?: HotkeyId }
  renderCard: (list: T) => ReactNode
  empty: { title: string; description: string; action?: ReactNode }
}

/** The lists pages (mine, shared with me): same header, toolbar, grid and empty states. */
export function ListOverview<T extends OverviewList>({
  title,
  subtitle,
  lists,
  loading,
  storageKey,
  withStatusFilter = false,
  primaryAction,
  renderCard,
  empty
}: ListOverviewProps<T>) {
  const t = useTranslations('ListsOverview')
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, 200)
  const [status, setStatus] = useLocalStorage<StatusFilter>({
    key: `${storageKey}-status`,
    defaultValue: 'active'
  })
  const [sort, setSort] = useLocalStorage<SortOrder>({
    key: `${storageKey}-sort`,
    defaultValue: 'updated'
  })

  const visible = useMemo(() => {
    const search = debouncedQuery.trim().toLowerCase()
    const filtered = lists.filter(list => {
      if (withStatusFilter && status === 'active' && list.archivedAt) return false
      if (withStatusFilter && status === 'archived' && !list.archivedAt) return false
      if (!search) return true
      return (
        list.title.toLowerCase().includes(search) ||
        (list.description?.toLowerCase().includes(search) ?? false)
      )
    })

    const time = (value: Date | string) => new Date(value).getTime()
    return filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
        case 'created':
          return time(b.createdAt) - time(a.createdAt)
        case 'open':
          return b.openTasks - a.openTasks
        case 'updated':
        default:
          return time(b.updatedAt) - time(a.updatedAt)
      }
    })
  }, [lists, debouncedQuery, status, sort, withStatusFilter])

  const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'updated', label: t('sort.updated') },
    { value: 'name', label: t('sort.name') },
    { value: 'created', label: t('sort.created') },
    { value: 'open', label: t('sort.open') }
  ]
  const statusOptions = [
    { value: 'active', label: t('status.active') },
    { value: 'archived', label: t('status.archived') },
    { value: 'all', label: t('status.all') }
  ]

  const hasLists = lists.length > 0
  const filtering = debouncedQuery.trim() !== '' || (withStatusFilter && status !== 'active')

  const resetFilters = () => {
    setQuery('')
    setStatus('active')
  }

  return (
    // Bottom room: the last row isn't glued to the edge, and clears the phone's gesture bar
    <Container size="lg" pt="lg" pb={{ base: 'calc(5rem + env(safe-area-inset-bottom))', sm: '4rem' }}>
      <Group justify="space-between" align="flex-end" mb={{ base: 'md', sm: 'lg' }} gap="sm" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Title order={2}>{title}</Title>
          <Text c="dimmed" size="sm">
            {loading ? '\u00a0' : subtitle}
          </Text>
        </div>
        {primaryAction && (
          <Tooltip
            label={primaryAction.hotkey ? <HotkeyBinding hotkey={primaryAction.hotkey} /> : null}
            disabled={!primaryAction.hotkey}
            openDelay={500}
          >
            <Button
              visibleFrom="sm"
              leftSection={<IconPlus size={18} />}
              radius="md"
              onClick={primaryAction.onClick}
              style={{ flexShrink: 0 }}
            >
              {primaryAction.label}
            </Button>
          </Tooltip>
        )}
      </Group>

      {/* Phones: the main action floats in the thumb zone, above the gesture bar */}
      {primaryAction && (
        <Affix
          hiddenFrom="sm"
          zIndex={150}
          position={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))', right: '1.25rem' }}
        >
          <Button
            size="md"
            radius="xl"
            leftSection={<IconPlus size={20} />}
            onClick={primaryAction.onClick}
            style={{ boxShadow: 'var(--mantine-shadow-lg)' }}
          >
            {primaryAction.label}
          </Button>
        </Affix>
      )}

      {hasLists && (
        <Stack gap="xs" mb={{ base: 'md', sm: 'lg' }}>
          <Group gap="sm" wrap="nowrap">
            <TextInput
              flex={1}
              miw={0}
              radius="md"
              leftSection={<IconSearch size={16} />}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              value={query}
              onChange={event => setQuery(event.currentTarget.value)}
              rightSectionPointerEvents="all"
              rightSection={
                query ? (
                  <Input.ClearButton aria-label={t('clearSearch')} onClick={() => setQuery('')} />
                ) : undefined
              }
            />
            <Select
              visibleFrom="sm"
              w={200}
              radius="md"
              allowDeselect={false}
              leftSection={<IconArrowsSort size={16} />}
              aria-label={t('sort.label')}
              value={sort}
              onChange={value => value && setSort(value as SortOrder)}
              data={sortOptions}
              comboboxProps={{ withinPortal: true }}
            />
            {/* Phones: sorting in a menu, the search keeps the whole row */}
            <Box hiddenFrom="sm">
              <Menu position="bottom-end" shadow="md" width={220}>
                <Menu.Target>
                  <ActionIcon variant="default" size={36} radius="md" aria-label={t('sort.label')}>
                    <IconArrowsSort size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{t('sort.label')}</Menu.Label>
                  {sortOptions.map(option => (
                    <Menu.Item
                      key={option.value}
                      onClick={() => setSort(option.value)}
                      rightSection={sort === option.value ? <IconCheck size={16} /> : null}
                      fw={sort === option.value ? 600 : undefined}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Box>
            {withStatusFilter && (
              <SegmentedControl
                visibleFrom="sm"
                radius="md"
                value={status}
                onChange={value => setStatus(value as StatusFilter)}
                aria-label={t('status.label')}
                data={statusOptions}
              />
            )}
          </Group>
          {withStatusFilter && (
            <SegmentedControl
              hiddenFrom="sm"
              fullWidth
              radius="md"
              value={status}
              onChange={value => setStatus(value as StatusFilter)}
              aria-label={t('status.label')}
              data={statusOptions}
            />
          )}
        </Stack>
      )}

      {loading ? (
        <SimpleGrid cols={GRID_COLS} spacing={GRID_SPACING}>
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <Card key={index} withBorder radius="md" p="md">
              <Group gap="sm" wrap="nowrap">
                <Skeleton h={34} w={34} radius="md" />
                <Stack gap={6} flex={1}>
                  <Skeleton h={14} w="60%" />
                  <Skeleton h={10} w="85%" />
                </Stack>
              </Group>
              <Skeleton h={8} mt="lg" radius="xl" />
              <Skeleton h={10} w="40%" mt="md" />
            </Card>
          ))}
        </SimpleGrid>
      ) : !hasLists ? (
        <EmptyState
          icon={<IconMoodEmpty size={28} />}
          title={empty.title}
          description={empty.description}
          action={empty.action}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<IconSearchOff size={28} />}
          title={
            debouncedQuery.trim()
              ? t('noResults', { query: debouncedQuery.trim() })
              : t('noResultsFilter')
          }
          description={t('noResultsHint')}
          action={
            filtering && (
              <Button variant="light" radius="md" onClick={resetFilters}>
                {t('resetFilters')}
              </Button>
            )
          }
        />
      ) : (
        <SimpleGrid cols={GRID_COLS} spacing={GRID_SPACING}>
          {visible.map(list => (
            <div key={list.id}>{renderCard(list)}</div>
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Stack align="center" gap="xs" py={64} px="md" ta="center">
      <ThemeIcon size={56} radius="xl" variant="light" color="gray">
        {icon}
      </ThemeIcon>
      <Text fw={600} mt="xs">
        {title}
      </Text>
      <Text size="sm" c="dimmed" maw={360}>
        {description}
      </Text>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </Stack>
  )
}
