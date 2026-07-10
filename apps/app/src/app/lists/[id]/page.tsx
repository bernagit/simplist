import ListPage from '@/components/list/ListPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Lists',
  description: 'View and manage your lists.'
}

export default function Page() {
  return <ListPage />
}
