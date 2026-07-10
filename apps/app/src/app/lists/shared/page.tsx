'use client'

import ListOverview from '@/components/list/ListOverview'
import { useLists } from '@/queries/lists'

export default function Page() {
  const { data: lists, isLoading } = useLists()

  const sharedLists = lists?.data.shared ?? []

  return <ListOverview data={sharedLists} isLoading={isLoading} shared={true} />
}
