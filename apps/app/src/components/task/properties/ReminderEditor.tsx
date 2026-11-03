'use client'

import { Alert, Button, Group, SegmentedControl, Select, Stack, Switch, Text } from '@mantine/core'
import { ClearableTimeInput } from '@/components/common/ClearableTimeInput'
import { IconBellOff, IconSettings } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { TaskProperties } from '@/models/task'
import { ReminderDefaults, useLeadTimeLabel, useLeadTimeOptions } from '@/hooks/useOptionLabel'
import { openSettingsModal } from '@/lib/modals/common'
import { useDevice } from '@/hooks/useDevice'

export type ReminderStatus =
  /** Reminders can reach the user */
  | 'ready'
  /** The server has no push keys */
  | 'unavailable'
  /** Turned off in the account, or no device has notifications on */
  | 'off'

type ReminderEditorProps = {
  value: TaskProperties
  defaults: ReminderDefaults
  status: ReminderStatus
  onChange: (patch: Partial<TaskProperties>) => void
}

export function ReminderEditor({ value, defaults, status, onChange }: ReminderEditorProps) {
  const t = useTranslations('TaskProperties.reminder')
  const leadLabel = useLeadTimeLabel()
  const leadOptions = useLeadTimeOptions()
  const { isMobile } = useDevice()

  const timed = Boolean(value.dueTime)
  const custom = timed ? value.reminderLeadMinutes !== null : value.reminderTime !== null
  const defaultLabel = timed
    ? defaults && leadLabel(defaults.leadMinutes)
    : defaults && t('atTime', { time: defaults.allDayTime })

  const setCustom = (isCustom: boolean) => {
    if (!isCustom) {
      onChange(timed ? { reminderLeadMinutes: null } : { reminderTime: null })
      return
    }
    // Start from the default, so switching shows the current behaviour
    onChange(
      timed
        ? { reminderLeadMinutes: defaults?.leadMinutes ?? 0 }
        : { reminderTime: defaults?.allDayTime ?? '09:00' }
    )
  }

  return (
    <Stack gap="sm">
      <Switch
        label={t('toggle')}
        description={timed ? t('toggleDescTimed') : t('toggleDescAllDay')}
        checked={value.reminderEnabled}
        onChange={event => onChange({ reminderEnabled: event.currentTarget.checked })}
      />

      {value.reminderEnabled && (
        <>
          <SegmentedControl
            fullWidth
            size="xs"
            value={custom ? 'custom' : 'default'}
            onChange={mode => setCustom(mode === 'custom')}
            data={[
              { value: 'default', label: t('default') },
              { value: 'custom', label: t('custom') }
            ]}
          />

          {!custom && defaultLabel && (
            <Text size="sm" c="dimmed">
              {t('defaultIs', { value: defaultLabel })}
            </Text>
          )}

          {custom && timed && (
            <Select
              allowDeselect={false}
              data={leadOptions}
              value={String(value.reminderLeadMinutes ?? 0)}
              onChange={minutes =>
                minutes !== null && onChange({ reminderLeadMinutes: Number(minutes) })
              }
              comboboxProps={{ withinPortal: false }}
            />
          )}

          {custom && !timed && (
            <ClearableTimeInput
              label={t('timeOnDueDate')}
              value={value.reminderTime}
              // Cleared = back to the default time
              onChange={time => onChange({ reminderTime: time })}
            />
          )}
        </>
      )}

      {status !== 'ready' && (
        <Alert
          variant="light"
          color={status === 'unavailable' ? 'gray' : 'yellow'}
          icon={<IconBellOff size={16} />}
          p="xs"
        >
          <Stack gap={6}>
            <Text size="xs">{status === 'unavailable' ? t('unavailable') : t('off')}</Text>
            {status === 'off' && (
              <Group>
                <Button
                  size="compact-xs"
                  variant="light"
                  leftSection={<IconSettings size={14} />}
                  onClick={() => openSettingsModal(Boolean(isMobile), 'notifications')}
                >
                  {t('openSettings')}
                </Button>
              </Group>
            )}
          </Stack>
        </Alert>
      )}
    </Stack>
  )
}
