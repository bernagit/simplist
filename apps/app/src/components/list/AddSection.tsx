'use client'

import { useSidebar } from '@/providers/SidebarProvider'
import { Button, Divider, Group, Stack, Text, TextInput } from '@mantine/core'
import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'

type AddSectionProps = {
  listId: string
  onSave?: (listId: string, sectionTitle: string) => Promise<void> | void
}

export default function AddSection({ listId, onSave }: AddSectionProps) {
  const t = useTranslations('AddSection')
  const { isTouch } = useSidebar()

  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sectionTitle, setSectionTitle] = useState('')

  const handleSave = useCallback(async () => {
    if (sectionTitle.trim().length === 0 || isSubmitting) return

    try {
      setIsSubmitting(true)
      if (onSave) {
        await onSave(listId, sectionTitle.trim())
      }
      setSectionTitle('')
      setIsClicked(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [sectionTitle, isSubmitting, onSave, listId])

  const handleCancel = useCallback(() => {
    setIsClicked(false)
    setSectionTitle('')
  }, [])

  if (!isClicked) {
    return (
      <Divider
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        label={
          <Text c="dimmed" size="sm">
            {t('addSection')}
          </Text>
        }
        style={{
          opacity: isTouch || isHovered ? 1 : 0,
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
          marginTop: isTouch ? 16 : 8
        }}
        onClick={() => setIsClicked(true)}
      />
    )
  }

  return (
    <Stack gap={0} p={0} mt="md" ml="lg" w="90%">
      <TextInput
        autoFocus
        placeholder={t('placeholder')}
        value={sectionTitle}
        onChange={e => setSectionTitle(e.target.value)}
        disabled={isSubmitting}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
          } else if (e.key === 'Escape') {
            handleCancel()
          }
        }}
      />
      <Group justify="flex-end" mt="xs" pt="xs">
        <Button
          variant="subtle"
          color="gray"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          {t('cancel')}
        </Button>
        <Button
          loading={isSubmitting}
          disabled={sectionTitle.trim().length === 0}
          onClick={handleSave}
        >
          {t('addSection')}
        </Button>
      </Group>
    </Stack>
  )
}