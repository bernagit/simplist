'use client'

import { Select } from '@mantine/core'
import { useLocale, useTranslations } from 'next-intl'
import { setLocaleAction } from '@/app/actions/locale'
import type { Locale } from '@/i18n/config'

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('Common')

  const handleChange = async (value: string | null) => {
    if (value && value !== locale) {
      await setLocaleAction(value as Locale)
    }
  }

  return (
    <Select
      aria-label={t('language')}
      value={locale}
      onChange={handleChange}
      data={[
        { value: 'en', label: 'English' },
        { value: 'it', label: 'Italiano' },
        { value: 'es', label: 'Español' }
      ]}
      style={{ width: 130 }}
    />
  )
}