'use client'

import { Badge, Button, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconArchive,
  IconArchiveOff,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconShare,
  IconTrash,
  IconUsers
} from '@tabler/icons-react'
import type { ContextMenuItemOptions } from 'mantine-contextmenu'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createListModal, shareListModal, updateListModal } from '@/lib/modals/list'
import { OwnedList } from '@/models/lists'
import { useArchiveList, useDeleteList, useLists, useUnarchiveList } from '@/queries/lists'
import { usePreferences } from '@/queries/preferences'
import { useUpdatedLabel } from './overview/useListOverviewLabels'
import { ListOverview } from './overview/ListOverview'
import { ListCard } from './overview/ListCard'
import { openListInfoModal } from './overview/ListInfo'

export default function OwnedListOverview() {
  const t = useTranslations('OwnedListOverview')
  const router = useRouter()
  const { data: lists, isLoading } = useLists()
  const { data: pref } = usePreferences(true)
  const confirm = pref?.data.confirmDelete ?? true
  const archiveList = useArchiveList()
  const unarchiveList = useUnarchiveList()
  const deleteList = useDeleteList()
  const tInfo = useTranslations('ListsOverview.info')
  const updatedLabel = useUpdatedLabel()

  const owned = lists?.data.owned ?? []
  const activeCount = owned.filter(list => !list.archivedAt).length

  const archive = (list: OwnedList) => {
    if (!confirm) {
      archiveList.mutate(list.id)
      return
    }
    modals.openConfirmModal({
      fullScreen: false,
      title: t('archiveModalTitle'),
      children: (
        <Stack gap="xs">
          <Text size="sm">{t('archiveModalConfirm')}</Text>
          <Text size="sm" c="dimmed">
            {t('archiveModalWarning')}
          </Text>
        </Stack>
      ),
      labels: { confirm: t('archiveConfirmButton'), cancel: t('cancel') },
      confirmProps: { color: 'orange' },
      onConfirm: () => archiveList.mutateAsync(list.id)
    })
  }

  const remove = (list: OwnedList) => {
    if (!confirm) {
      deleteList.mutate(list.id)
      return
    }
    modals.openConfirmModal({
      fullScreen: false,
      title: t('deleteModalTitle'),
      children: <Text size="sm">{t('deleteModalConfirm')}</Text>,
      labels: { confirm: t('deleteConfirmButton'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteList.mutateAsync(list.id)
    })
  }

  const menuFor = (list: OwnedList): ContextMenuItemOptions[] => [
    {
      key: 'edit',
      icon: <IconEdit size={20} />,
      title: t('edit'),
      onClick: () => updateListModal(list.id, list)
    },
    {
      key: 'share',
      icon: <IconShare size={20} />,
      title: t('share'),
      onClick: () => shareListModal(list.id)
    },
    {
      key: 'info',
      icon: <IconInfoCircle size={20} />,
      title: t('moreInfo'),
      onClick: () => openListInfoModal(list, false, tInfo('title'))
    },
    { key: 'divider' },
    {
      key: 'archive',
      icon: list.archivedAt ? <IconArchiveOff size={20} /> : <IconArchive size={20} />,
      title: list.archivedAt ? t('unarchive') : t('archive'),
      onClick: () => (list.archivedAt ? unarchiveList.mutate(list.id) : archive(list))
    },
    {
      key: 'delete',
      icon: <IconTrash size={20} />,
      title: t('delete'),
      color: 'red',
      onClick: () => remove(list)
    }
  ]

  return (
    <ListOverview
      title={t('title')}
      subtitle={t('listCount', { count: activeCount })}
      lists={owned}
      loading={isLoading}
      storageKey="lists-owned"
      withStatusFilter
      primaryAction={{ label: t('newList'), onClick: createListModal, hotkey: 'NEW_LIST' }}
      empty={{
        title: t('emptyTitle'),
        description: t('emptyDescription'),
        action: (
          <Button radius="md" leftSection={<IconPlus size={18} />} onClick={createListModal}>
            {t('emptyAction')}
          </Button>
        )
      }}
      renderCard={list => (
        <ListCard
          list={list}
          shared={list.shared}
          menu={menuFor(list)}
          updatedLabel={updatedLabel(list.updatedAt)}
          onOpen={() => router.push(`/lists/${list.id}`)}
          compactFooter={
            list.shared && (
              <Text size="xs" c="dimmed">
                {t('sharedBadge')}
              </Text>
            )
          }
          footer={
            list.shared && (
              <Badge size="sm" variant="light" leftSection={<IconUsers size={12} />}>
                {t('sharedBadge')}
              </Badge>
            )
          }
        />
      )}
    />
  )
}
