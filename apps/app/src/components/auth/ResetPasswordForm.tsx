'use client'

import { authService } from '@/services/auth'
import { Anchor, Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconLock, IconMail } from '@tabler/icons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { LoadingScreen } from './LoadingScreen'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('mail') ?? ''

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: ''
    },

    validate: {
      password: value => (value.length < 8 ? 'Password must be at least 8 characters' : null),

      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null
    }
  })

  async function handleSubmit(values: typeof form.values) {
    if (!token || !email) {
      showNotification({
        title: 'Invalid reset link',
        message: 'The password reset link is invalid or incomplete.',
        color: 'red'
      })
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(email, token, values.password)

      setSubmitted(true)

      showNotification({
        title: 'Password updated',
        message: 'Your password has been reset successfully.',
        color: 'green'
      })
    } catch (err) {
      showNotification({
        title: 'Reset failed',
        message: (err as Error).message,
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (submitted) {
    return (
      <Stack>
        <div>Your password has been updated successfully.</div>

        <Button fullWidth onClick={() => router.push('/login')}>
          Go to login
        </Button>
      </Stack>
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Email" value={email} disabled leftSection={<IconMail size={16} />} />

        <PasswordInput
          label="New password"
          placeholder="Enter your new password"
          leftSection={<IconLock size={16} />}
          autoComplete="new-password"
          {...form.getInputProps('password')}
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Confirm your new password"
          leftSection={<IconLock size={16} />}
          autoComplete="new-password"
          {...form.getInputProps('confirmPassword')}
        />

        <Button fullWidth type="submit" mt="md">
          Reset password
        </Button>

        <Anchor onClick={() => router.push('/login')} size="sm" ta="center">
          Back to login
        </Anchor>
      </Stack>
    </form>
  )
}
