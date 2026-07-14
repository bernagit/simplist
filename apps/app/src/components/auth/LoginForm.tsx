'use client'

import { authService } from '@/services/auth'
import {
  Button,
  PasswordInput,
  Stack,
  TextInput
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LoadingScreen } from './LoadingScreen'

export function LoginForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      identifier: '',
      password: ''
    },

    validate: {
      identifier: value =>
        value.length < 5 ? 'Please enter a valid email' : null,

      password: value =>
        value.length < 6
          ? 'Password must be at least 6 characters'
          : null
    }
  })

  async function handleSubmit(values: typeof form.values) {
    setLoading(true)

    try {
      await authService.login(
        values.identifier,
        values.password
      )

      router.push('/')
    } catch (err) {
      showNotification({
        title: 'Login failed',
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>

        <TextInput
          label="Email"
          placeholder="john@example.com"
          {...form.getInputProps('identifier')}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          {...form.getInputProps('password')}
        />

        <Button
          fullWidth
          type="submit"
          mt="md"
        >
          Sign in
        </Button>

      </Stack>
    </form>
  )
}