'use client'

import { MouseEvent, KeyboardEvent } from 'react'
import { Button, Checkbox, Group, Stack, Text, TextInput, Textarea, Title } from '@mantine/core'

type TaskContentProps = {
  completed: boolean
  onToggle: () => void
  canEdit?: boolean
  color: string
  hasDescription: boolean
  isEditing: boolean
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStartEditing: () => void
  onSave: () => void
  onCancel: (e: MouseEvent<HTMLButtonElement>) => void
}

export default function TaskContent({
  completed,
  onToggle,
  canEdit,
  color,
  hasDescription,
  isEditing,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onStartEditing,
  onSave,
  onCancel
}: TaskContentProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Prevent event from bubbling up to drag-and-drop or parent hotkey listeners
    e.stopPropagation()

    // Trigger save on Ctrl + Enter or Cmd + Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      // Call cancel with the keyboard event casted as mouse event to satisfy handler type signature
      onCancel(e as unknown as MouseEvent<HTMLButtonElement>)
    }
  }

  return (
    <Group align="start">
      <Checkbox
        size="lg"
        radius="xl"
        checked={completed}
        mt={hasDescription ? 10 : 0}
        onChange={onToggle}
        disabled={!canEdit}
        color={color}
        styles={{
          root: { opacity: completed ? 0.6 : 1, transition: 'opacity 150ms ease' },
          input: { border: `1px solid ${color}`, backgroundColor: completed ? color : undefined }
        }}
      />

      <Stack
        flex={1}
        gap={4}
        style={{
          opacity: !isEditing && completed ? 0.6 : 1,
          transition: 'opacity 150ms ease',
          border: isEditing ? '1px solid var(--mantine-color-gray-4)' : undefined,
          borderRadius: 6,
          padding: isEditing ? 8 : 0
        }}
        onClick={() => canEdit && !completed && onStartEditing()}
      >
        {isEditing ? (
          <>
            <TextInput
              variant="unstyled"
              value={title}
              onChange={e => onTitleChange(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task name"
              styles={{ input: { fontSize: 24, fontWeight: 700 } }}
              autoFocus
            />

            <Textarea
              variant="unstyled"
              value={description}
              onChange={e => onDescriptionChange(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description"
              autosize
              minRows={2}
            />

            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onSave}>Save</Button>
            </Group>
          </>
        ) : (
          <>
            <Title order={3}>{title}</Title>
            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Group>
  )
}
