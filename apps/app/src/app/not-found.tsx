'use client'

import { Container, Title, Text, Button, Group, Stack, Card } from '@mantine/core'
import { IconHome, IconListSearch, IconMapPinOff } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function NotFoundPage() {
  const t = useTranslations('Errors.notFound')
  const router = useRouter()

  return (
    <Container size="sm" py={80}>
      <Card withBorder radius="md" p="xl" ta="center">
        <Stack align="center" gap="md">
          <IconMapPinOff size={64} opacity={0.4} />

          <Text size="xl" fw={900} c="dimmed" style={{ fontSize: '4rem', lineHeight: 1 }}>
            {t('code')}
          </Text>

          <Title order={2}>{t('title')}</Title>

          <Text c="dimmed" size="sm" style={{ maxWidth: 420 }}>
            {t('subtitle')}
          </Text>

          <Group justify="center" mt="md">
            <Button
              variant="filled"
              leftSection={<IconHome size={18} />}
              onClick={() => router.push('/')}
            >
              {t('backHome')}
            </Button>
            <Button
              variant="light"
              leftSection={<IconListSearch size={18} />}
              onClick={() => router.push('/lists')}
            >
              {t('goLists')}
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}