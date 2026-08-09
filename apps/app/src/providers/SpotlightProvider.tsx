'use client'

import { Spotlight, SpotlightActionData, SpotlightActionGroupData } from '@mantine/spotlight'
import { useDebouncedValue } from '@mantine/hooks'
import {
  IconCalendar,
  IconHome,
  IconList,
  IconPlus,
  IconSearch,
  IconSection,
  IconShare
} from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { useSidebar } from '@/providers/SidebarProvider'
import { baseService } from '@/services/base'
import { createListModal } from '@/lib/modals/list'
import { getHTMLSectionId } from '@/utils/misc'
import { HotkeyBinding } from '@/components/common/KeyBinding'
import { ThemeIcon } from '@mantine/core'

export function SpotlightProvider() {
  const t = useTranslations('SpotlightProvider')
  const router = useRouter()
  const { isMobile, toggle } = useSidebar()

  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, 200)

  const goToList = useCallback(
    (listId: string) => {
      router.push(`/lists/${listId}`)
      setQuery('')
    },
    [router]
  )

  const goToSection = useCallback(
    (listId: string, sectionId: string) => {
      router.push(`/lists/${listId}#${getHTMLSectionId(sectionId)}`)
      setQuery('')
    },
    [router]
  )

  const baseActions = useMemo<(SpotlightActionGroupData | SpotlightActionData)[]>(
    () => [
      {
        group: t('groups.navigation'),
        actions: [
          {
            id: 'go-home',
            label: t('actions.goHome'),
            onClick: () => {
              router.push('/')
              setQuery('')
              if (isMobile) toggle()
            },
            leftSection: <IconHome size={18} />,
            rightSection: <HotkeyBinding hotkey="GO_HOME" />
          },
          {
            id: 'go-calendar',
            label: t('actions.goCalendar'),
            onClick: () => {
              router.push('/calendar')
              setQuery('')
              if (isMobile) toggle()
            },
            leftSection: <IconCalendar size={18} />,
            rightSection: <HotkeyBinding hotkey="GO_CALENDAR" />
          },
          {
            id: 'go-lists',
            label: t('actions.goLists'),
            onClick: () => {
              router.push('/lists')
              setQuery('')
              if (isMobile) toggle()
            },
            leftSection: <IconList size={18} />,
            rightSection: <HotkeyBinding hotkey="GO_LISTS" />
          },
          {
            id: 'go-shared',
            label: t('actions.goShared'),
            onClick: () => {
              router.push('/lists/shared')
              setQuery('')
              if (isMobile) toggle()
            },
            leftSection: <IconShare size={18} />,
            rightSection: <HotkeyBinding hotkey="GO_SHARED_LISTS" />
          }
        ]
      },
      {
        group: t('groups.actions'),
        actions: [
          {
            id: 'create-list',
            label: t('actions.createList'),
            onClick: () => {
              createListModal()
              setQuery('')
            },
            leftSection: <IconPlus size={18} />,
            rightSection: <HotkeyBinding hotkey="NEW_LIST" />
          }
        ]
      }
    ],
    [router, isMobile, toggle, t]
  )

  // TODO: add recent lists to the spotlight actions
  const [actions, setActions] = useState(baseActions)

  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setActions(baseActions)
        return
      }

      const response = await baseService.globalSearch(debouncedQuery)

      const lists: SpotlightActionData[] = response.data.lists.map(list => ({
        id: list.id,
        label: list.title,
        description: list.description ?? '',
        onClick: () => goToList(list.id),
        leftSection: (
          <ThemeIcon variant="subtle" color={list.color ?? 'gray'} size="sm">
            <IconList size={18} />
          </ThemeIcon>
        )
      }))

      const sections: SpotlightActionData[] = response.data.sections.map(section => ({
        id: section.id,
        label: section.title,
        description: t('descriptions.sectionInList', { listName: section.listName }),
        onClick: () => goToSection(section.listId, section.id),
        leftSection: <IconSection size={18} />
      }))

      setActions([...lists, ...sections])
    }

    search()
  }, [debouncedQuery, baseActions, goToList, goToSection, t])

  return (
    <Spotlight
      actions={actions}
      onQueryChange={setQuery}
      onSpotlightClose={() => setActions(baseActions)}
      searchProps={{
        leftSection: <IconSearch size={20} />,
        placeholder: t('placeholder')
      }}
      scrollable
    />
  )
}