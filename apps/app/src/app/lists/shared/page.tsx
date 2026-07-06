'use client'

import { useLists } from '@/queries/lists'
import ListPage from '@/components/list/ListPage'

export default function Page() {
  const { data: lists, isLoading } = useLists()

  const sharedLists = lists?.data.shared ?? []

  return (
    <ListPage data={sharedLists} isLoading={isLoading} />
  )
}