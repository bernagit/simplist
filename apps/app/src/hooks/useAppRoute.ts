'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function useAppRoute() {
  const pathname = usePathname()
  const t = useTranslations('Breadcrumbs')

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)

    const isLists = segments[0] === 'lists'
    const isShared = isLists && segments[1] === 'shared'

    const listId = isLists ? (isShared ? (segments[2] ?? null) : (segments[1] ?? null)) : null

    const breadcrumbs = (() => {
      if (pathname === '/') return []

      switch (segments[0]) {
        case 'lists':
          if (segments.length === 1) return [{ label: t('myLists'), href: '/lists' }]
          if (isShared) return [{ label: t('shared'), href: '/lists/shared' }]
          if (listId) return [{ label: t('myLists'), href: '/lists' }]

          return []

        default:
          return [
            {
              label: capitalize(segments.join(' ')),
              href: pathname
            }
          ]
      }
    })()

    return {
      pathname,
      segments,
      breadcrumbs,

      isLists,
      isShared,

      listId,

      canShare: !!listId && !isShared
    }
  }, [pathname, t])
}