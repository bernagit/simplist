'use client'

import { Select, Stack, Switch, Text } from '@mantine/core'
import { useUpdatePreferences } from '@/queries/preferences'
import { UserPreferences } from '@/models/user'
import { useLists } from '@/queries/lists'

type Props = {
  preferences?: UserPreferences | undefined
  loading?: boolean
}

export function GeneralSection({ preferences, loading }: Props) {
  const updatePreferences = useUpdatePreferences()

  const { data: lists } = useLists()

  const options = [
    { value: 'home', label: 'Home' },
    { value: 'calendar', label: 'Calendar' },
    ...(lists?.data.owned.map(list => ({
      value: `list:${list.id}`,
      label: list.title
    })) ?? [])
  ]

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            Default view
          </Text>

          <Text size="xs" c="dimmed">
            Choose what opens first when you launch Simplist.
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
            Start of week
          </Text>

          <Text size="xs" c="dimmed">
            Used for the Calendar view.
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
              label: 'Sunday'
            },
            {
              value: 'monday',
              label: 'Monday'
            }
          ]}
          w={220}
        />
      </Stack>

      <Switch
        checked={(preferences?.settings.confirmDelete as boolean | undefined) ?? true}
        disabled={loading}
        onChange={event =>
          updatePreferences.mutate({
            settings: {
              confirmDelete: event.currentTarget.checked
            }
          })
        }
        label="Ask for confirmation before deleting"
        description="Show a confirmation dialog when deleting a list or task."
      />
    </Stack>
  )
}
