'use client'

import { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  useMantineTheme
} from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useMe, useUpdateMe, useUpdatePassword } from '@/queries/auth'
import { AvatarPicker } from '../common/AvatarPicker'
import { useTranslations } from 'next-intl'

export function AccountSection() {
  const t = useTranslations('AccountSection')
  const { data: me, isLoading } = useMe()
  const theme = useMantineTheme()

  const [name, setName] = useState(me?.name ?? '')
  const [email, setEmail] = useState(me?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarPickerOpened, setAvatarPickerOpened] = useState(false)

  const [avatar, setAvatar] = useState(me?.avatar ?? null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const updateUser = useUpdateMe()
  const changePassword = useUpdatePassword()

  const profileDirty =
    name !== (me?.name ?? '') ||
    email !== (me?.email ?? '') ||
    avatar !== (me?.avatar ?? null)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateUser.mutateAsync({ name, email, avatar })
      notifications.show({
        title: t('profile.notifications.successTitle'),
        message: t('profile.notifications.successMessage'),
        color: 'green'
      })
    } catch {
      notifications.show({
        title: t('profile.notifications.errorTitle'),
        message: t('profile.notifications.errorMessage'),
        color: 'red'
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: t('password.notifications.mismatchTitle'),
        message: t('password.notifications.mismatchMessage'),
        color: 'red'
      })
      return
    }

    setSavingPassword(true)
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword })
      notifications.show({
        title: t('password.notifications.successTitle'),
        message: t('password.notifications.successMessage'),
        color: 'green'
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      notifications.show({
        title: t('password.notifications.errorTitle'),
        message: t('password.notifications.errorMessage'),
        color: 'red'
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const openDeleteAccountModal = () =>
    modals.openConfirmModal({
      title: t('dangerZone.modal.title'),
      centered: true,
      children: <Text size="sm">{t('dangerZone.modal.message')}</Text>,
      labels: {
        confirm: t('dangerZone.modal.confirm'),
        cancel: t('dangerZone.modal.cancel')
      },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        // await accountService.deleteAccount()
      }
    })

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          {t('profile.subtitle')}
        </Text>

        <Group align="center" gap="md">
          <Avatar radius="xl" size="lg" color={theme.primaryColor} src={avatar}>
            {!avatar && me?.initials}
          </Avatar>
          <Button variant="default" size="xs" onClick={() => setAvatarPickerOpened(true)}>
            {t('profile.changePhoto')}
          </Button>
        </Group>

        <AvatarPicker
          opened={avatarPickerOpened}
          onClose={() => setAvatarPickerOpened(false)}
          value={avatar}
          onChange={setAvatar}
        />

        <TextInput
          label={t('profile.email')}
          value={email}
          onChange={event => setEmail(event.currentTarget.value)}
          disabled={true}
          maw={360}
        />

        <TextInput
          label={t('profile.name')}
          value={name}
          onChange={event => setName(event.currentTarget.value)}
          disabled={isLoading}
          maw={360}
        />

        <Group justify="flex-end">
          <Button
            onClick={handleSaveProfile}
            loading={savingProfile}
            disabled={!profileDirty}
            size="sm"
          >
            {t('profile.saveChanges')}
          </Button>
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            {t('password.title')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('password.subtitle')}
          </Text>
        </div>

        <PasswordInput
          label={t('password.current')}
          value={currentPassword}
          onChange={event => setCurrentPassword(event.currentTarget.value)}
          maw={360}
        />

        <PasswordInput
          label={t('password.new')}
          value={newPassword}
          onChange={event => setNewPassword(event.currentTarget.value)}
          maw={360}
        />

        <PasswordInput
          label={t('password.confirm')}
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.currentTarget.value)}
          maw={360}
        />

        <Group justify="flex-end">
          <Button
            onClick={handleChangePassword}
            loading={savingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            size="sm"
          >
            {t('password.update')}
          </Button>
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Group gap={6}>
          <IconAlertTriangle size={16} color="var(--mantine-color-red-6)" />
          <Text fw={500} size="sm" c="red">
            {t('dangerZone.title')}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {t('dangerZone.subtitle')}
        </Text>

        <Box>
          <Button disabled color="red" variant="light" size="sm" onClick={openDeleteAccountModal}>
            {t('dangerZone.deleteAccount')}
          </Button>
        </Box>
      </Stack>
    </Stack>
  )
}