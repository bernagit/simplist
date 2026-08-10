'use client'

import { authService } from '@/services/auth'
import { Anchor, Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconMail } from '@tabler/icons-react'
import { useState } from 'react'
import { LoadingScreen } from './LoadingScreen'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordForm() {
  const t = useTranslations('ForgotPasswordForm')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    initialValues: {
      email: ''
    },

    validate: {
      email: value => (/^\S+@\S+$/.test(value) ? null : t('validation.emailInvalid'))
    }
  })

  async function handleSubmit(values: typeof form.values) {
    setLoading(true)

    try {
      await authService.forgotPassword(values.email)

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

        <Anchor onClick={() => router.push('/login')} size="sm" ta="center">
          {t('backToLogin')}
        </Anchor>
      </Stack>
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label={t('emailLabel')}
          placeholder={t('emailPlaceholder')}
          leftSection={<IconMail size={16} />}
          autoComplete="email"
          {...form.getInputProps('email')}
        />

        <Button fullWidth type="submit" mt="md">
          {t('submitButton')}
        </Button>

        <Anchor href="/login" size="sm" ta="center">
          {t('rememberPassword')}
        </Anchor>
      </Stack>
    </form>
  )
}