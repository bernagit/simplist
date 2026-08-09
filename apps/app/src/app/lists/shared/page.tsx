import SharedListOverview from '@/components/list/SharedListOverview'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SharedListsPage')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default function Page() {
  return <SharedListOverview />
}