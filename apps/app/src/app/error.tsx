'use client'

import { useEffect } from 'react'
import { Container, Title, Text, Button, Group, Stack, Card } from '@mantine/core'
import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Errors.globalError')
  const router = useRouter()

  useEffect(() => {
    // Registra l'errore su un servizio di monitoraggio (es. Sentry, LogRocket)
    console.error('Unhandled app error:', error)
  }, [error])

  return (
    <Container size="sm" py={80}>
      <Card withBorder radius="md" p="xl" ta="center">
        <Stack align="center" gap="md">
          <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />

          <Text size="xl" fw={900} c="red" style={{ fontSize: '4rem', lineHeight: 1 }}>
            {t('code')}
          </Text>

          <Title order={2}>{t('title')}</Title>

          <Text c="dimmed" size="sm" style={{ maxWidth: 420 }}>
            {t('subtitle')}
          </Text>

          <Group justify="center" mt="md">
            <Button
              variant="filled"
              color="red"
              leftSection={<IconRefresh size={18} />}
              onClick={() => reset()}
            >
              {t('tryAgain')}
            </Button>
            <Button
              variant="light"
              color="gray"
              leftSection={<IconHome size={18} />}
              onClick={() => router.push('/')}
            >
              {t('backHome')}
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}