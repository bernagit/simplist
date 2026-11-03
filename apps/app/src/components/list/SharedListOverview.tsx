'use client'

import { Avatar, Group, Text } from '@mantine/core'
import { IconDoorExit, IconInfoCircle } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLists } from '@/queries/lists'
import { useLeaveListAction } from '@/hooks/useLeaveListAction'
import { useUpdatedLabel } from './overview/useListOverviewLabels'
import { ListOverview } from './overview/ListOverview'
import { ListCard } from './overview/ListCard'
import { openListInfoModal } from './overview/ListInfo'

export default function SharedListOverview() {
  const t = useTranslations('SharedListOverview')
  const router = useRouter()
  const { data: lists, isLoading } = useLists()
  const tInfo = useTranslations('ListsOverview.info')
  const updatedLabel = useUpdatedLabel()
  const leave = useLeaveListAction()
  const shared = lists?.data.shared ?? []

  return (
    <ListOverview
      title={t('title')}
      subtitle={t('listCount', { count: shared.length })}
      lists={shared}
      loading={isLoading}
      storageKey="lists-shared"
      empty={{ title: t('emptyTitle'), description: t('emptyDescription') }}
      renderCard={list => (
        <ListCard
          list={list}
          shared
          menu={[
            {
              key: 'info',
              icon: <IconInfoCircle size={20} />,
              title: t('moreInfo'),
              onClick: () => openListInfoModal(list, true, tInfo('title'))
            },
            { key: 'divider' },
            {
              key: 'leave',
              icon: <IconDoorExit size={20} />,
              title: t('leave'),
              color: 'red',
              onClick: () => leave(list)
            }
          ]}
          updatedLabel={updatedLabel(list.updatedAt)}
          onOpen={() => router.push(`/lists/shared/${list.id}`)}
          compactFooter={
            <Text size="xs" c="dimmed" truncate>
              {list.owner.name ?? list.owner.email}
            </Text>
          }
          footer={
            <Group gap={6} wrap="nowrap">
              <Avatar src={list.owner.avatar} size={20} radius="xl">
                {(list.owner.name ?? list.owner.email).charAt(0).toUpperCase()}
              </Avatar>
              <Text size="xs" c="dimmed" truncate>
                {list.owner.name ?? list.owner.email}
              </Text>
            </Group>
          }
        />
      )}
    />
  )
}
