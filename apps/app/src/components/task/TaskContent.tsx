'use client'

import { KeyboardEvent } from 'react'
import { Button, Checkbox, Group, Stack, Text, Textarea } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useDevice } from '@/hooks/useDevice'

type TaskContentProps = {
  completed: boolean
  onToggle: () => void
  canEdit?: boolean
  color: string
  isEditing: boolean
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStartEditing: () => void
  onSave: () => void
  onCancel: () => void
}

/** Checkbox, title and description of a task, edited in place. */
export default function TaskContent({
  completed,
  onToggle,
  canEdit,
  color,
  isEditing,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onStartEditing,
  onSave,
  onCancel
}: TaskContentProps) {
  const t = useTranslations('TaskContent')
  const { isTouch } = useDevice()
  const editable = Boolean(canEdit) && !completed

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, isTitle: boolean) => {
    // Keep keys away from drag and drop and the app's shortcuts
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey || isTitle)) {
      // Enter in the title saves (a title has one line); Ctrl/Cmd+Enter saves anywhere
      event.preventDefault()
      onSave()
    }
  }

  return (
    <Group align="flex-start" wrap="nowrap" gap="sm">
      <Checkbox
        size="md"
        radius="xl"
        mt={6}
        checked={completed}
        onChange={onToggle}
        disabled={!canEdit}
        color={color}
        aria-label={title}
        styles={{
          input: {
            borderColor: color,
            borderWidth: 2,
            cursor: canEdit ? 'pointer' : 'default'
          }
        }}
      />

      <Stack gap={6} flex={1} miw={0}>
        {isEditing ? (
          <>
            <Textarea
              variant="unstyled"
              autosize
              minRows={1}
              autoFocus
              value={title}
              placeholder={t('titlePlaceholder')}
              onChange={event => onTitleChange(event.currentTarget.value.replace(/\n/g, ' '))}
              onKeyDown={event => handleKeyDown(event, true)}
              styles={{
                input: { fontSize: 22, fontWeight: 700, lineHeight: 1.3, padding: 0 }
              }}
            />
            <Textarea
              variant="unstyled"
              autosize
              minRows={2}
              value={description}
              placeholder={t('descriptionPlaceholder')}
              onChange={event => onDescriptionChange(event.currentTarget.value)}
              onKeyDown={event => handleKeyDown(event, false)}
              styles={{ input: { fontSize: isTouch ? 16 : 14, padding: 0 } }}
            />
            <Group justify="flex-end" gap="xs">
              <Button variant="default" size="xs" onClick={onCancel}>
                {t('cancel')}
              </Button>
              <Button size="xs" disabled={!title.trim()} onClick={onSave}>
                {t('save')}
              </Button>
            </Group>
          </>
        ) : (
          <div
            role={editable ? 'button' : undefined}
            tabIndex={editable ? 0 : undefined}
            onClick={() => editable && onStartEditing()}
            onKeyDown={event => editable && event.key === 'Enter' && onStartEditing()}
            style={{ cursor: editable ? 'text' : 'default', overflowWrap: 'anywhere' }}
          >
            <Text
              fz={22}
              fw={700}
              lh={1.3}
              {...(completed ? { td: 'line-through', c: 'dimmed' } : {})}
            >
              {title}
            </Text>
            {description ? (
              <Text size="sm" c="dimmed" mt={6} style={{ whiteSpace: 'pre-wrap' }}>
                {description}
              </Text>
            ) : (
              editable && (
                <Text size="sm" c="dimmed" mt={6} opacity={0.7}>
                  {t('addDescription')}
                </Text>
              )
            )}
          </div>
        )}
      </Stack>
    </Group>
  )
}
