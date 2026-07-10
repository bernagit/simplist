'use client'

import ListOverview from '@/components/list/ListOverview'
import { useLists } from '@/queries/lists'

export default function Page() {
  const { data: lists, isLoading } = useLists()

  const ownedLists = lists?.data.owned ?? []

  return <ListOverview data={ownedLists} isLoading={isLoading} shared={false} />
}
