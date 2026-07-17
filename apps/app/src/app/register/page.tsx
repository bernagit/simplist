'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  Alert,
  Anchor,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'

import { useForm } from '@mantine/form'

import { IconAlertCircle, IconKey, IconLock, IconMail, IconUser } from '@tabler/icons-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { authService } from '@/services/auth'
import { showNotification } from '@mantine/notifications'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [invalidInvite, setInvalidInvite] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      password: '',
      confirmPassword: ''
    },

    validate: {
      name: value => (value.trim().length < 2 ? 'Please enter your name' : null),

      password: value => (value.length < 8 ? 'Password must contain at least 8 characters' : null),

      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null
    }
  })

  useEffect(() => {
    let cancelled = false

    async function loadInvite() {
      if (!token) {
        if (!cancelled) {
          setInvalidInvite(true)
          setLoading(false)
        }
        return
      }
      try {
        const response = await authService.checkInvite(token)

        if (!cancelled) {
          setEmail(response.data.email)
        }
      } catch {
        if (!cancelled) {
          setInvalidInvite(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInvite()

    return () => {
      cancelled = true
    }
  }, [token])

  async function registerWithPassword() {
    try {
      await authService.register(form.values.name, email, form.values.password, token!)

      router.push('/')

      showNotification({
        title: 'Registration successful',
        message: 'You have successfully registered and logged in.',
        color: 'green'
      })
    } catch (err) {
      showNotification({
        title: 'Registration failed',
        message: (err as Error).message,
        color: 'red'
      })
    }
  }

  if (loading) {
    return (
      <AuthCard title="Checking invitation...">
        <Text>Loading...</Text>
      </AuthCard>
    )
  }

  if (invalidInvite) {
    return (
      <AuthCard title="Invitation required" subtitle="This invitation is no longer valid.">
        <Alert color="red" icon={<IconAlertCircle size={18} />}>
          This invitation has expired or has already been used.
        </Alert>

        <Button component="a" href="/login" fullWidth mt="lg">
          Back to login
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="You're invited!" subtitle="Complete your account to join Simplist.">
      <form onSubmit={form.onSubmit(registerWithPassword)}>
        <Stack>
          <TextInput
            label="Email"
            value={email}
            disabled
            required
            leftSection={<IconMail size={16} />}
          />

          <TextInput
            label="Full name"
            required
            placeholder="John Doe"
            leftSection={<IconUser size={16} />}
            autoComplete="name"
            {...form.getInputProps('name')}
          />

          <PasswordInput
            label="Password"
            required
            placeholder="Choose a secure password"
            leftSection={<IconLock size={16} />}
            autoComplete="new-password"
            {...form.getInputProps('password')}
          />

          <PasswordInput
            label="Confirm password"
            required
            placeholder="Repeat your password"
            leftSection={<IconLock size={16} />}
            autoComplete="new-password"
            {...form.getInputProps('confirmPassword')}
          />

          <Button type="submit" fullWidth mt="md">
            Create account
          </Button>

          <Divider label="OR" labelPosition="center" />

          <Tooltip label="Coming soon" openDelay={500}>
            <Button variant="light" fullWidth leftSection={<IconKey size={18} />} disabled>
              Register with Passkey
            </Button>
          </Tooltip>

          <Group justify="center" mt="xs">
            <Text size="sm" c="dimmed">
              Already have an account?
            </Text>

            <Anchor href="/login" size="sm">
              Sign in
            </Anchor>
          </Group>
        </Stack>
      </form>
    </AuthCard>
  )
}
