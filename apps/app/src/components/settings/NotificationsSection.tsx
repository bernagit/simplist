  'use client'

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Select,
  Stack,
  Switch,
  Text,
  Tooltip
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import {
  IconBellOff,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconInfoCircle,
  IconShare2,
  IconTrash
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { usePushDevice } from '@/hooks/usePushDevice'
import { getTimezone } from '@/lib/push'
import { NotificationDevice } from '@/models/notification'
import { useLeadTimeOptions } from '@/hooks/useOptionLabel'
import {
  useNotificationConfig,
  useNotificationDevices,
  useNotificationSettings,
  useRemoveDevice,
  useSendTestNotification,
  useUpdateNotificationSettings
} from '@/queries/notifications'

const comboboxProps = { withinPortal: true, zIndex: 9999 }

/** "Chrome on Android", from the user agent stored with the device */
function describeDevice(userAgent: string | null) {
  if (!userAgent) return { name: null, mobile: false }
  const os = /Android/.test(userAgent)
    ? 'Android'
    : /iPhone|iPod/.test(userAgent)
      ? 'iPhone'
      : /iPad/.test(userAgent)
        ? 'iPad'
        : /Windows/.test(userAgent)
          ? 'Windows'
          : /Mac OS X|Macintosh/.test(userAgent)
            ? 'macOS'
            : /Linux/.test(userAgent)
              ? 'Linux'
              : null
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /SamsungBrowser/.test(userAgent)
      ? 'Samsung Internet'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : null
  const name = [browser, os].filter(Boolean).join(' · ') || null
  return { name, mobile: /Android|iPhone|iPod|iPad|Mobile/.test(userAgent) }
}

function SettingRow({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Group justify="space-between" wrap="nowrap" align="center" gap="md">
      <div style={{ minWidth: 0 }}>
        <Text fw={500} size="sm">
          {title}
        </Text>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </Group>
  )
}

export function NotificationsSection() {
  const t = useTranslations('NotificationsSection')
  const { data: config, isLoading: configLoading } = useNotificationConfig()
  const pushEnabledOnServer = config?.data.enabled ?? false

  const { data: settingsResp } = useNotificationSettings(pushEnabledOnServer)
  const { data: devicesResp } = useNotificationDevices(pushEnabledOnServer)
  const updateSettings = useUpdateNotificationSettings()
  const leadOptions = useLeadTimeOptions()
  const removeDevice = useRemoveDevice()
  const sendTest = useSendTestNotification()
  const device = usePushDevice(config?.data.publicKey)

  const settings = settingsResp?.data
  const devices = devicesResp?.data ?? []
  const deviceTimezone = getTimezone()

  // Saved when a full HH:MM is typed, not on every keystroke
  const [allDayTime, setAllDayTime] = useState(settings?.allDayTime ?? '09:00')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the saved value
    if (settings?.allDayTime) setAllDayTime(settings.allDayTime)
  }, [settings?.allDayTime])

  if (configLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (!pushEnabledOnServer) {
    return (
      <Alert variant="light" color="gray" icon={<IconBellOff size={18} />}>
        {t('server.disabled')}
      </Alert>
    )
  }


  const handleDeviceToggle = async (checked: boolean) => {
    if (!checked) {
      await device.disable()
      return
    }
    const result = await device.enable()
    if (result === 'error') {
      notifications.show({ color: 'red', title: t('errors.title'), message: t('errors.enable') })
    }
  }

  const handleTest = async () => {
    try {
      const { data } = await sendTest.mutateAsync({
        title: t('test.notificationTitle'),
        body: t('test.notificationBody')
      })
      notifications.show({
        color: data.sent > 0 ? 'teal' : 'red',
        message:
          data.sent > 0 ? t('test.sent', { count: data.sent }) : t('test.failed')
      })
    } catch {
      notifications.show({ color: 'red', message: t('test.failed') })
    }
  }

  const handleRemove = async (item: NotificationDevice) => {
    if (item.endpoint === device.endpoint) {
      await device.disable()
      return
    }
    await removeDevice.mutateAsync(item.id)
  }

  const saveAllDayTime = (value: string) => {
    setAllDayTime(value)
    if (/^\d{2}:\d{2}$/.test(value) && value !== settings?.allDayTime) {
      updateSettings.mutate({ allDayTime: value })
    }
  }

  const remindersOn = settings?.enabled ?? false

  return (
    <Stack gap="xl">
      {/* THIS DEVICE */}
      <Stack gap="sm">
        <Text fw={600}>{t('device.title')}</Text>

        {device.support === 'needs-install' && (
          <Alert variant="light" icon={<IconShare2 size={18} />}>
            {t('device.needsInstall')}
          </Alert>
        )}

        {device.support === 'unsupported' && (
          <Alert variant="light" color="gray" icon={<IconBellOff size={18} />}>
            {t('device.unsupported')}
          </Alert>
        )}

        {device.support === 'supported' && device.permission === 'denied' && (
          <Alert variant="light" color="red" icon={<IconBellOff size={18} />}>
            {t('device.blocked')}
          </Alert>
        )}

        {device.support === 'supported' && device.permission !== 'denied' && (
          <>
            <SettingRow title={t('device.toggle')} description={t('device.toggleDesc')}>
              <Switch
                checked={device.enabled}
                disabled={device.busy}
                onChange={event => handleDeviceToggle(event.currentTarget.checked)}
              />
            </SettingRow>

            {device.enabled && (
              <Group>
                <Button
                  variant="light"
                  size="xs"
                  loading={sendTest.isPending}
                  onClick={handleTest}
                >
                  {t('test.button')}
                </Button>
              </Group>
            )}
          </>
        )}
      </Stack>

      {/* REMINDERS (account) */}
      <Stack gap="md">
        <Text fw={600}>{t('reminders.title')}</Text>

        <SettingRow title={t('reminders.toggle')} description={t('reminders.toggleDesc')}>
          <Switch
            checked={remindersOn}
            disabled={!settings}
            onChange={event =>
              updateSettings.mutate({
                enabled: event.currentTarget.checked,
                timezone: deviceTimezone
              })
            }
          />
        </SettingRow>

        <SettingRow title={t('reminders.allDay')} description={t('reminders.allDayDesc')}>
          <TimeInput
            w={110}
            value={allDayTime}
            disabled={!remindersOn}
            onChange={event => saveAllDayTime(event.currentTarget.value)}
          />
        </SettingRow>

        <SettingRow title={t('reminders.lead')} description={t('reminders.leadDesc')}>
          <Select
            w={190}
            comboboxProps={comboboxProps}
            allowDeselect={false}
            disabled={!remindersOn}
            data={leadOptions}
            value={String(settings?.leadMinutes ?? 0)}
            onChange={value => value && updateSettings.mutate({ leadMinutes: Number(value) })}
          />
        </SettingRow>

        <SettingRow title={t('reminders.shared')} description={t('reminders.sharedDesc')}>
          <Switch
            checked={settings?.sharedLists ?? true}
            disabled={!remindersOn}
            onChange={event => updateSettings.mutate({ sharedLists: event.currentTarget.checked })}
          />
        </SettingRow>

        {settings && (
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <IconInfoCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <Text size="xs" c="dimmed">
              {t('reminders.timezone', { timezone: settings.timezone })}{' '}
              {settings.timezone !== deviceTimezone && (
                <Button
                  variant="subtle"
                  size="compact-xs"
                  onClick={() => updateSettings.mutate({ timezone: deviceTimezone })}
                >
                  {t('reminders.useTimezone', { timezone: deviceTimezone })}
                </Button>
              )}
            </Text>
          </Group>
        )}
      </Stack>

      {/* DEVICES */}
      <Stack gap="sm">
        <Text fw={600}>{t('devices.title')}</Text>

        {devices.length === 0 && (
          <Text size="sm" c="dimmed">
            {t('devices.empty')}
          </Text>
        )}

        {devices.map(item => {
          const { name, mobile } = describeDevice(item.userAgent)
          const isThisDevice = item.endpoint === device.endpoint
          return (
            <Group key={item.id} justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                {mobile ? <IconDeviceMobile size={20} /> : <IconDeviceDesktop size={20} />}
                <div style={{ minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={500} truncate>
                      {name ?? t('devices.unknown')}
                    </Text>
                    {isThisDevice && (
                      <Badge size="xs" variant="light">
                        {t('devices.thisDevice')}
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {item.lastSuccessAt
                      ? t('devices.lastNotified', {
                          date: dayjs(item.lastSuccessAt).format('D MMM YYYY, HH:mm')
                        })
                      : t('devices.added', { date: dayjs(item.createdAt).format('D MMM YYYY') })}
                  </Text>
                </div>
              </Group>
              <Tooltip label={t('devices.remove')} withinPortal zIndex={9999}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={t('devices.remove')}
                  loading={removeDevice.isPending && removeDevice.variables === item.id}
                  onClick={() => handleRemove(item)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )
        })}
      </Stack>
    </Stack>
  )
}
