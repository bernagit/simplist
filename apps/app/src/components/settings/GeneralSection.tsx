'use client'

import { Select, Stack, Switch, Text } from '@mantine/core'
import { useLocale, useTranslations } from 'next-intl'
import { useUpdatePreferences } from '@/queries/preferences'
import { UserPreferences } from '@/models/user'
import { useLists } from '@/queries/lists'
import { setLocaleAction } from '@/app/actions/locale'
import type { Locale } from '@/i18n/config'

type Props = {
  preferences?: UserPreferences | undefined
  loading?: boolean
}

export function GeneralSection({ preferences, loading }: Props) {
  const updatePreferences = useUpdatePreferences()
  const { data: lists } = useLists()

  const locale = useLocale()
  const t = useTranslations('GeneralSection')

  const handleLanguageChange = async (value: string | null) => {
    if (value && value !== locale) {
      await setLocaleAction(value as Locale)
    }
  }

  const options = [
    { value: 'home', label: t('views.home') },
    { value: 'calendar', label: t('views.calendar') },
    ...(lists?.data.owned.map(list => ({
      value: `list:${list.id}`,
      label: list.title
    })) ?? [])
  ]

  return (
    <Stack gap="xl">
      {/* Language Preference Control */}
      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            {t('languageTitle')}
          </Text>

          <Text size="xs" c="dimmed">
            {t('languageDesc')}
          </Text>
        </div>

        <Select
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999
          }}
          value={locale}
          disabled={loading ?? false}
          onChange={handleLanguageChange}
          data={[
            { value: 'en', label: 'English' },
            { value: 'it', label: 'Italiano' },
          ]}
          w={220}
        />
      </Stack>

      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            {t('defaultViewTitle')}
          </Text>

          <Text size="xs" c="dimmed">
            {t('defaultViewDesc')}
          </Text>
        </div>

        <Select
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999
          }}
          value={preferences?.defaultView ?? null}
          disabled={loading ?? false}
          onChange={value =>
            value &&
            updatePreferences.mutate({
              defaultView: value as string
            })
          }
          data={options}
          w={220}
        />
      </Stack>

      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            {t('startOfWeekTitle')}
          </Text>

          <Text size="xs" c="dimmed">
            {t('startOfWeekDesc')}
          </Text>
        </div>

        <Select
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999
          }}
          value={preferences?.startOfWeek ?? null}
          disabled={loading ?? false}
          onChange={value =>
            value &&
            updatePreferences.mutate({
              startOfWeek: value as string
            })
          }
          data={[
            {
              value: 'sunday',
              label: t('days.sunday')
            },
            {
              value: 'monday',
              label: t('days.monday')
            }
          ]}
          w={220}
        />
      </Stack>

      <Switch
        checked={preferences?.confirmDelete ?? true}
        disabled={loading}
        onChange={event =>
          updatePreferences.mutate({
            confirmDelete: event.currentTarget.checked
          })
        }
        label={t('confirmDeleteLabel')}
        description={t('confirmDeleteDesc')}
      />
    </Stack>
  )
}