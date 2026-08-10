'use client'

import { ActionIcon, Button, Group, Stack, Text, Title } from '@mantine/core'
import { ContextModalProps } from '@mantine/modals'
import { IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

type ConfirmArchiveProps = {
  onConfirm?: () => void
}

export default function ConfirmArchive({
  context,
  id,
  innerProps
}: ContextModalProps<ConfirmArchiveProps>) {
  const t = useTranslations('ConfirmArchive')

  const handleConfirm = () => {
    innerProps?.onConfirm?.()
    context.closeModal(id)
  }

  return (
    <Stack gap="md">
      {/* Header del Modale */}
      <Group justify="space-between" align="center">
        <Title order={3}>{t('title')}</Title>
        <ActionIcon variant="subtle" color="gray" onClick={() => context.closeModal(id)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {/* Messaggio principale e avviso */}
      <Stack gap="xs">
        <Text size="sm">{t('message')}</Text>
        <Text size="sm" c="dimmed">
          {t('warning')}
        </Text>
      </Stack>

      {/* Azioni del Modale */}
      <Group justify="flex-end" mt="sm">
        <Button variant="outline" color="gray" onClick={() => context.closeModal(id)}>
          {t('actions.cancel')}
        </Button>
        <Button color="orange" onClick={handleConfirm}>
          {t('actions.archive')}
        </Button>
      </Group>
    </Stack>
  )
}