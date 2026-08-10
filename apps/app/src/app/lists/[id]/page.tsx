import ListPage from '@/components/list/ListPage'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ListPage')

  return {
    title: t('title'),
    description: t('description')
  }
}

export default function Page() {
  return <ListPage />
}