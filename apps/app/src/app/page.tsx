import Homepage from '@/components/Homepage'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('HomePage')

  return {
    title: t('title'),
    description: t('description')
  }
}

export default function HomePage() {
  return <Homepage />
}