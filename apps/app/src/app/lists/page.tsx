import OwnedListOverview from '@/components/list/OwnedListOverview'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('MyListsPage')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default function Page() {
  return <OwnedListOverview />
}