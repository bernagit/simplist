'use client'

import { useLists } from '@/queries/lists'
import ListPage from '@/components/list/ListPage'

export default function Page() {
  const { data: lists, isLoading } = useLists()

  const ownedLists = lists?.data.owned ?? []

  return (
    <ListPage data={ownedLists} isLoading={isLoading} />
  )
}