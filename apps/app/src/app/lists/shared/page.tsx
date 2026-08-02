import SharedListOverview from '@/components/list/SharedListOverview'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared With Me - Simplist',
  description: 'View and manage lists that have been shared with you.',
}

export default function Page() {

  return <SharedListOverview />
}
