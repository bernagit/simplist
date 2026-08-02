import OwnedListOverview from '@/components/list/OwnedListOverview'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Lists - Simplist',
  description: 'View and manage your owned lists.',
}

export default function Page() {
  return <OwnedListOverview />
}
