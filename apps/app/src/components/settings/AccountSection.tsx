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
  TextInput
} from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useMe, useUpdateMe, useUpdatePassword } from '@/queries/auth'

export function AccountSection() {
  const { data: me, isLoading } = useMe()

  const [name, setName] = useState(me?.name ?? '')
  const [email, setEmail] = useState(me?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const updateUser = useUpdateMe()
  const changePassword = useUpdatePassword()

  const profileDirty = name !== (me?.name ?? '') || email !== (me?.email ?? '')

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateUser.mutateAsync({ name, email })
      notifications.show({
        title: 'Profile updated',
        message: 'Your changes have been saved.',
        color: 'green'
      })
    } catch {
      notifications.show({
        title: 'Something went wrong',
        message: 'Could not update your profile. Please try again.',
        color: 'red'
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Passwords do not match',
        message: 'Please make sure both passwords are identical.',
        color: 'red'
      })
      return
    }

    setSavingPassword(true)
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword })
      notifications.show({
        title: 'Password changed',
        message: 'Your password has been updated.',
        color: 'green'
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      notifications.show({
        title: 'Something went wrong',
        message: 'Could not change your password. Please check your current password.',
        color: 'red'
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const openDeleteAccountModal = () =>
    modals.openConfirmModal({
      title: 'Delete account',
      centered: true,
      children: (
        <Text size="sm">
          This will permanently delete your account and all your lists and tasks. This action cannot
          be undone.
        </Text>
      ),
      labels: { confirm: 'Delete account', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        // await accountService.deleteAccount()
      }
    })

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            Profile
          </Text>
          <Text size="xs" c="dimmed">
            Update your name and email address.
          </Text>
        </div>

        <Group align="center" gap="md">
          <Avatar radius="xl" size="lg">
            {me?.initials}
          </Avatar>
          <Button variant="default" size="xs" disabled>
            Change photo
          </Button>
        </Group>
    
        <TextInput
          label="Email"
          value={email}
          onChange={event => setEmail(event.currentTarget.value)}
          disabled={true}
          maw={360}
        />

        <TextInput
          label="Name"
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
            Save changes
          </Button>
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <div>
          <Text fw={500} size="sm">
            Password
          </Text>
          <Text size="xs" c="dimmed">
            Choose a strong password to keep your account secure.
          </Text>
        </div>

        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={event => setCurrentPassword(event.currentTarget.value)}
          maw={360}
        />

        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={event => setNewPassword(event.currentTarget.value)}
          maw={360}
        />

        <PasswordInput
          label="Confirm new password"
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
            Update password
          </Button>
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Group gap={6}>
          <IconAlertTriangle size={16} color="var(--mantine-color-red-6)" />
          <Text fw={500} size="sm" c="red">
            Danger zone
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          Permanently delete your account and all associated data. This cannot be undone.
        </Text>

        <Box>
          <Button disabled color="red" variant="light" size="sm" onClick={openDeleteAccountModal}>
            Delete account
          </Button>
        </Box>
      </Stack>
    </Stack>
  )
}
