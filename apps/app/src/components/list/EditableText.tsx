'use client'

import { TextInput, Title, TitleOrder, useComputedColorScheme } from '@mantine/core'
import { useCallback, useRef, useState } from 'react'

type EditableTitleProps = {
  canEdit?: boolean
  order: TitleOrder
  value: string
  onSave: (value: string) => Promise<void> | void
}

export function EditableTitle({ canEdit, order, value, onSave }: EditableTitleProps) {
  const colorScheme = useComputedColorScheme()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const startEditing = useCallback(() => {
    if (!canEdit) return
    setDraft(value)
    setEditing(true)

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [canEdit, value])

  const save = useCallback(async () => {
    const trimmed = draft.trim()

    if (trimmed && trimmed !== value) {
      await onSave(trimmed)
    }

    setEditing(false)
  }, [draft, value, onSave])

  const cancel = () => {
    setEditing(false)
  }

  if (editing) {
    return (
      <TextInput
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.currentTarget.value)}
        onBlur={save}
        onKeyDown={e => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') cancel()
        }}
        variant="unstyled"
        styles={{
          root: {
            margin: 0
          },

          wrapper: {
            margin: 0
          },

          input: {
            padding: '2px 6px 0px 6px',
            margin: 0,
            height: 'auto',
            minHeight: 0,

            fontSize: `var(--mantine-h${order}-font-size)`,
            fontWeight: `var(--mantine-h${order}-font-weight)`,
            lineHeight: `var(--mantine-h${order}-line-height)`,

            fontFamily: 'inherit',

            border: 0,
            background: 'transparent'
          }
        }}
      />
    )
  }

  return (
    <Title
      order={order}
      onClick={startEditing}
      style={{
        display: 'inline-block',
        cursor: 'text',
        padding: '2px 6px 0px 6px',
        borderRadius: 6,
        border: '1px solid transparent',
        transition: 'border-color 150ms'
      }}
      onMouseEnter={e => {
        if (!canEdit) return
        e.currentTarget.style.borderColor =
          colorScheme === 'dark' ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-4)'
      }}
      onMouseLeave={e => {
        if (!canEdit) return
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      {value}
    </Title>
  )
}
