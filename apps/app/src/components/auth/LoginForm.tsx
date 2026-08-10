'use client'

import { Anchor, Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LoadingScreen } from './LoadingScreen'
import { IconLock, IconMail } from '@tabler/icons-react'
import { useAuth } from '@/providers/AuthProvider'
import { useQueryClient } from '@tanstack/react-query'
import { preferencesService } from '@/services/preferences'
import { getDefaultViewFromString } from '@/utils/misc'
import { useTranslations } from 'next-intl'

export function LoginForm() {
  const t = useTranslations('LoginForm')
  const router = useRouter()
  const { login } = useAuth()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      identifier: '',
      password: ''
    },

    validate: {
      identifier: value => (value.length < 5 ? t('validation.emailInvalid') : null),
      password: value => (value.length < 6 ? t('validation.passwordMinLength') : null)
    }
  })

  async function handleSubmit(values: typeof form.values) {
    setLoading(true)

    try {
      await login(values.identifier, values.password)

      let redirectTo = '/'
      try {
        const res = await queryClient.fetchQuery({
          queryKey: ['preferences'],
          queryFn: preferencesService.getPreferences,
          staleTime: 1000 * 60 * 10
        })

        const defaultView = res.data.defaultView
        redirectTo = getDefaultViewFromString(defaultView)
      } catch {
        // safe to ignore
      }

      router.push(redirectTo)
    } catch (err) {
      showNotification({
        title: t('notifications.loginFailed'),
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
          label={t('emailLabel')}
          placeholder={t('emailPlaceholder')}
          leftSection={<IconMail size={16} />}
          autoComplete="email"
          {...form.getInputProps('identifier')}
        />

        <PasswordInput
          label={t('passwordLabel')}
          placeholder={t('passwordPlaceholder')}
          leftSection={<IconLock size={16} />}
          autoComplete="current-password"
          {...form.getInputProps('password')}
        />
        <Anchor href="/forgot-password" size="sm" ta="right">
          {t('forgotPassword')}
        </Anchor>

        <Button fullWidth type="submit" mt="md">
          {t('submitButton')}
        </Button>
      </Stack>
    </form>
  )
}