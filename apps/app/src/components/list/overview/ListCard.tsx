'use client'

import { KeyboardEvent, ReactNode } from 'react'
import { Badge, Card, Group, Progress, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconList, IconUsers } from '@tabler/icons-react'
import type { ContextMenuItemOptions } from 'mantine-contextmenu'
import { useContextMenu } from 'mantine-contextmenu'
import { useTranslations } from 'next-intl'
import { List, ListTaskCounts } from '@/models/lists'
import { contextMenuStyles } from '@/utils/misc'
import { ActionsMenu } from '../../common/ActionsMenu'
import classes from './ListCard.module.css'

const FALLBACK_COLOR = 'var(--mantine-color-gray-5)'
const PERCENT = 100

type ListCardProps = {
  list: List & ListTaskCounts
  /** Shared list icon instead of the list icon */
  shared?: boolean
  menu: ContextMenuItemOptions[]
  /** Bottom-left: sharing state or owner */
  footer?: ReactNode
  /** Same, in the one-line summary on phones (short text) */
  compactFooter?: ReactNode
  /** Bottom-right: last update */
  updatedLabel: string
  onOpen: () => void
}

/** A list in the overview: title, description, progress, and its actions. */
export function ListCard({
  list,
  shared,
  menu,
  footer,
  compactFooter,
  updatedLabel,
  onOpen
}: ListCardProps) {
  const t = useTranslations('ListsOverview')
  const { showContextMenu } = useContextMenu()
  const color = list.color ?? FALLBACK_COLOR
  const done = list.totalTasks - list.openTasks
  const progress = list.totalTasks > 0 ? (done / list.totalTasks) * PERCENT : 0

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  const tasksLabel =
    list.totalTasks === 0
      ? t('noTasks')
      : list.openTasks === 0
        ? t('allDone', { count: list.totalTasks })
        : t('openTasks', { open: list.openTasks, total: list.totalTasks })

  return (
    <Card
      withBorder
      radius="md"
      p={{ base: 'sm', sm: 'md' }}
      role="link"
      tabIndex={0}
      aria-label={list.title}
      className={classes.card}
      data-archived={list.archivedAt ? true : undefined}
      style={{ '--list-color': color } as React.CSSProperties}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      onContextMenu={showContextMenu(menu, { styles: contextMenuStyles })}
    >
      <Group justify="space-between" wrap="nowrap" align="center" gap="sm">
        <Group gap="sm" wrap="nowrap" miw={0} flex={1}>
          <ThemeIcon radius="md" size="lg" variant="light" color={color} style={{ flexShrink: 0 }}>
            {shared ? <IconUsers size={18} /> : <IconList size={18} />}
          </ThemeIcon>
          <Stack gap={2} miw={0} flex={1}>
            <Group gap={6} wrap="nowrap" miw={0}>
              <Text fw={600} truncate>
                {list.title}
              </Text>
              {list.archivedAt && (
                <Badge size="xs" variant="light" color="gray" style={{ flexShrink: 0 }}>
                  {t('archived')}
                </Badge>
              )}
            </Group>
            {/* Desktop: the description; phones: one line of facts instead */}
            {list.description && (
              <Text
                visibleFrom="sm"
                size="sm"
                c="dimmed"
                lineClamp={2}
                style={{ overflowWrap: 'anywhere' }}
              >
                {list.description}
              </Text>
            )}
            <Group hiddenFrom="sm" gap={6} wrap="nowrap" miw={0}>
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {tasksLabel}
              </Text>
              {compactFooter && (
                <>
                  <Text size="xs" c="dimmed">
                    ·
                  </Text>
                  <div style={{ minWidth: 0, display: 'flex' }}>{compactFooter}</div>
                </>
              )}
            </Group>
          </Stack>
        </Group>

        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
          <RingProgress
            hiddenFrom="sm"
            size={34}
            thickness={3}
            roundCaps
            sections={[{ value: progress, color }]}
            aria-label={t('progress')}
          />
          <ActionsMenu items={menu} label={list.title} />
        </Group>
      </Group>

      <Stack visibleFrom="sm" gap={6} mt="auto">
        <Text size="xs" c="dimmed">
          {tasksLabel}
        </Text>
        <Progress value={progress} size="sm" radius="xl" color={color} aria-label={t('progress')} />
      </Stack>

      <Group visibleFrom="sm" justify="space-between" gap="xs" wrap="nowrap">
        <div style={{ minWidth: 0 }}>{footer}</div>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {updatedLabel}
        </Text>
      </Group>
    </Card>
  )
}
