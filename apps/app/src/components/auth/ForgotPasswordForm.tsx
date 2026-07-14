'use client'

import { authService } from '@/services/auth'
import { Anchor, Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconMail } from '@tabler/icons-react'
import { useState } from 'react'
import { LoadingScreen } from './LoadingScreen'

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    initialValues: {
      email: ''
    },

    validate: {
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Please enter a valid email')
    }
  })

  async function handleSubmit(values: typeof form.values) {
    setLoading(true)

    try {
      await authService.forgotPassword(values.email)

      setSubmitted(true)

      showNotification({
        title: 'Email sent',
        message: 'If an account exists with this email, you will receive a password reset link.',
        color: 'green'
      })
    } catch (err) {
      showNotification({
        title: 'Request failed',
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
        <div>Check your email for a password reset link.</div>

        <Anchor href="/login" size="sm" ta="center">
          Back to login
        </Anchor>
      </Stack>
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Email"
          placeholder="john@example.com"
          leftSection={<IconMail size={16} />}
          autoComplete="email"
          {...form.getInputProps('email')}
        />

        <Button fullWidth type="submit" mt="md">
          Send reset link
        </Button>

        <Anchor href="/login" size="sm" ta="center">
          Remember your password? Sign in
        </Anchor>
      </Stack>
    </form>
  )
}
