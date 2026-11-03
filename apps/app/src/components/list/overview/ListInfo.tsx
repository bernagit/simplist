'use client'

import { ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconArchive,
  IconCalendarPlus,
  IconClockEdit,
  IconList,
  IconUsers
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { List, ListMember, ListTaskCounts } from '@/models/lists'
import { useListById } from '@/queries/lists'
import { useMe } from '@/queries/auth'

const PERCENT = 100
const FALLBACK_COLOR = 'var(--mantine-color-gray-5)'
const ROLE_ORDER: Record<ListMember['role'], number> = { owner: 0, editor: 1, viewer: 2 }

type InfoList = List & ListTaskCounts

type ListInfoProps = {
  list: InfoList
  /** Shared with me: open under /lists/shared */
  shared: boolean
  onClose: () => void
}

/** Opens the "More info" modal of a list (overview menus). */
export function openListInfoModal(list: InfoList, shared: boolean, title: string) {
  const modalId = `list-info-${list.id}`
  modals.open({
    modalId,
    title,
    fullScreen: false,
    radius: 'md',
    size: 'md',
    children: <ListInfo list={list} shared={shared} onClose={() => modals.close(modalId)} />
  })
}

function ListInfo({ list, shared, onClose }: ListInfoProps) {
  const t = useTranslations('ListsOverview.info')
  const tRoles = useTranslations('ListMembers')
  const router = useRouter()
  const { data: me } = useMe()
  // Members and sections are only in the list details (cached if the list was opened)
  const { data: details, isLoading } = useListById(list.id)
  const complete = details?.data

  const color = list.color ?? FALLBACK_COLOR
  const done = list.totalTasks - list.openTasks
  const progress = list.totalTasks > 0 ? (done / list.totalTasks) * PERCENT : 0
  const sections = complete
    ? complete.sections.filter(section => section.id !== complete.defaultSectionId).length
    : null
  const members = complete
    ? [...complete.members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
    : null

  const open = () => {
    onClose()
    router.push(shared ? `/lists/shared/${list.id}` : `/lists/${list.id}`)
  }

  const formatDate = (value: Date | string) => dayjs(value).format('D MMMM YYYY, HH:mm')

  return (
    <Stack gap="lg">
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <ThemeIcon size={44} radius="md" variant="light" color={color}>
          {shared ? <IconUsers size={22} /> : <IconList size={22} />}
        </ThemeIcon>
        <Stack gap={2} miw={0}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={700} size="lg" lineClamp={2} style={{ overflowWrap: 'anywhere' }}>
              {list.title}
            </Text>
            {list.archivedAt && (
              <Badge size="sm" variant="light" color="gray" style={{ flexShrink: 0 }}>
                {t('archivedBadge')}
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {list.description || t('noDescription')}
          </Text>
        </Stack>
      </Group>

      <Stack gap="xs">
        <SimpleGrid cols={3} spacing="xs">
          <Stat label={t('open')} value={list.openTasks} />
          <Stat label={t('done')} value={done} />
          <Stat label={t('sections')} value={sections} />
        </SimpleGrid>
        <Group gap="sm" wrap="nowrap">
          <Progress value={progress} color={color} radius="xl" size="sm" flex={1} />
          <Text size="xs" c="dimmed" w={36} ta="right">
            {Math.round(progress)}%
          </Text>
        </Group>
      </Stack>

      <Stack gap="xs">
        <Text size="sm" fw={600}>
          {t('members', { count: members?.length ?? 0 })}
        </Text>
        {isLoading || !members ? (
          <Stack gap="xs">
            <Skeleton h={32} radius="md" />
            <Skeleton h={32} radius="md" />
          </Stack>
        ) : (
          <Stack gap={6}>
            {members.map(member => {
              const name = member.name ?? member.email
              return (
                <Group key={member.id} gap="sm" wrap="nowrap" justify="space-between">
                  <Group gap="sm" wrap="nowrap" miw={0}>
                    <Avatar src={member.avatar} size={32} radius="xl">
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {name}
                        {member.userId === me?.id && (
                          <Text span size="xs" c="dimmed">
                            {' '}
                            {tRoles('you')}
                          </Text>
                        )}
                      </Text>
                      {member.name && (
                        <Text size="xs" c="dimmed" truncate>
                          {member.email}
                        </Text>
                      )}
                    </div>
                  </Group>
                  <Badge
                    size="sm"
                    variant={member.role === 'owner' ? 'light' : 'default'}
                    style={{ flexShrink: 0 }}
                  >
                    {tRoles(`roles.${member.role}`)}
                  </Badge>
                </Group>
              )
            })}
          </Stack>
        )}
      </Stack>

      <Stack gap={8}>
        <Detail icon={<IconCalendarPlus size={16} />} label={t('createdAt')}>
          {formatDate(list.createdAt)}
        </Detail>
        <Detail icon={<IconClockEdit size={16} />} label={t('updatedAt')}>
          {formatDate(list.updatedAt)}
        </Detail>
        {list.archivedAt && (
          <Detail icon={<IconArchive size={16} />} label={t('archivedAt')}>
            {formatDate(list.archivedAt)}
          </Detail>
        )}
      </Stack>

      <Group justify="flex-end" gap="xs">
        <Button variant="default" radius="md" onClick={onClose}>
          {t('close')}
        </Button>
        <Button radius="md" onClick={open}>
          {t('openList')}
        </Button>
      </Group>
    </Stack>
  )
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <Paper withBorder radius="md" p="xs" ta="center">
      {value === null ? (
        <Skeleton h={22} w={28} mx="auto" my={2} />
      ) : (
        <Text fw={700} size="lg" lh={1.3}>
          {value}
        </Text>
      )}
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Paper>
  )
}

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Group gap="sm" wrap="nowrap" c="dimmed">
      {icon}
      <Text size="sm" c="dimmed" w={130} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" c="var(--mantine-color-text)">
        {children}
      </Text>
    </Group>
  )
}
