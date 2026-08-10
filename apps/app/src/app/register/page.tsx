'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

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
import { inviteService } from '@/services/invite'

export default function RegisterPage() {
  const t = useTranslations('RegisterPage')
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [invalidInvite, setInvalidInvite] = useState(false)

  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: ''
    },
    validate: {
      email: value => (/^\S+@\S+\.\S+$/.test(value) ? null : t('validation.emailInvalid')),
      name: value => (value.trim().length < 2 ? t('validation.nameMinLength') : null),
      password: value => (value.length < 8 ? t('validation.passwordMinLength') : null),
      confirmPassword: (value, values) =>
        value !== values.password ? t('validation.passwordsDontMatch') : null
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
        const response = await inviteService.checkInvite(token)

        if (!cancelled) {
          if (response.data.email) {
            form.setFieldValue('email', response.data.email)
            form.setFieldValue('emailDisabled', true)
          } else {
            form.setFieldValue('emailDisabled', false)
          }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function registerWithPassword() {
    try {
      await authService.register(form.values.name, form.values.email, form.values.password, token!)

      router.push('/')

      showNotification({
        title: t('notifications.successTitle'),
        message: t('notifications.successMessage'),
        color: 'green'
      })
    } catch (err) {
      showNotification({
        title: t('notifications.errorTitle'),
        message: (err as Error).message,
        color: 'red'
      })
    }
  }

  if (loading) {
    return (
      <AuthCard title={t('loading.title')}>
        <Text>{t('loading.text')}</Text>
      </AuthCard>
    )
  }

  if (invalidInvite) {
    return (
      <AuthCard title={t('invalid.title')} subtitle={t('invalid.subtitle')}>
        <Alert color="red" icon={<IconAlertCircle size={18} />}>
          {t('invalid.message')}
        </Alert>

        <Button component="a" href="/login" fullWidth mt="lg">
          {t('invalid.backToLogin')}
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={t('form.title')} subtitle={t('form.subtitle')}>
      <form onSubmit={form.onSubmit(registerWithPassword)}>
        <Stack>
          <TextInput
            label={t('form.emailLabel')}
            {...form.getInputProps('email')}
            required
            leftSection={<IconMail size={16} />}
          />

          <TextInput
            label={t('form.nameLabel')}
            required
            placeholder={t('form.namePlaceholder')}
            leftSection={<IconUser size={16} />}
            autoComplete="name"
            {...form.getInputProps('name')}
          />

          <PasswordInput
            label={t('form.passwordLabel')}
            required
            placeholder={t('form.passwordPlaceholder')}
            leftSection={<IconLock size={16} />}
            autoComplete="new-password"
            {...form.getInputProps('password')}
          />

          <PasswordInput
            label={t('form.confirmPasswordLabel')}
            required
            placeholder={t('form.confirmPasswordPlaceholder')}
            leftSection={<IconLock size={16} />}
            autoComplete="new-password"
            {...form.getInputProps('confirmPassword')}
          />

          <Button type="submit" fullWidth mt="md">
            {t('form.submitButton')}
          </Button>

          <Divider label={t('form.divider')} labelPosition="center" />

          <Tooltip label={t('form.passkeyTooltip')} openDelay={500}>
            <Button variant="light" fullWidth leftSection={<IconKey size={18} />} disabled>
              {t('form.passkeyButton')}
            </Button>
          </Tooltip>

          <Group justify="center" mt="xs">
            <Text size="sm" c="dimmed">
              {t('form.alreadyHaveAccount')}
            </Text>

            <Anchor href="/login" size="sm">
              {t('form.signIn')}
            </Anchor>
          </Group>
        </Stack>
      </form>
    </AuthCard>
  )
}