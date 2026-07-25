import ListPage from '@/components/list/ListPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared With Me',
  description: 'View and manage lists that have been shared with you.'
}

export default function Page() {
  return <ListPage />
}
