'use client'

import { authService } from '@/services/auth'
import { Anchor, Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconLock, IconMail } from '@tabler/icons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { LoadingScreen } from './LoadingScreen'
import { useTranslations } from 'next-intl'

export default function ResetPasswordForm() {
  const t = useTranslations('ResetPasswordForm')
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
      password: value => (value.length < 8 ? t('validation.passwordMinLength') : null),
      confirmPassword: (value, values) =>
        value !== values.password ? t('validation.passwordsDontMatch') : null
    }
  })

  async function handleSubmit(values: typeof form.values) {
    if (!token || !email) {
      showNotification({
        title: t('notifications.invalidLinkTitle'),
        message: t('notifications.invalidLinkMessage'),
        color: 'red'
      })
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(email, token, values.password)

      setSubmitted(true)

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
        <div>{t('successMessage')}</div>

        <Button fullWidth onClick={() => router.push('/login')}>
          {t('goToLogin')}
        </Button>
      </Stack>
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label={t('emailLabel')} value={email} disabled leftSection={<IconMail size={16} />} />

        <PasswordInput
          label={t('passwordLabel')}
          placeholder={t('passwordPlaceholder')}
          leftSection={<IconLock size={16} />}
          autoComplete="new-password"
          {...form.getInputProps('password')}
        />

        <PasswordInput
          label={t('confirmPasswordLabel')}
          placeholder={t('confirmPasswordPlaceholder')}
          leftSection={<IconLock size={16} />}
          autoComplete="new-password"
          {...form.getInputProps('confirmPassword')}
        />

        <Button fullWidth type="submit" mt="md">
          {t('submitButton')}
        </Button>

        <Anchor onClick={() => router.push('/login')} size="sm" ta="center">
          {t('backToLogin')}
        </Anchor>
      </Stack>
    </form>
  )
}