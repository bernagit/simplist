'use client'

import { TextInput, Title, TitleOrder, useComputedColorScheme } from '@mantine/core'
import { Ref, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { isMousePointer } from '@/hooks/useMouseHover'

export type EditableTitleActions = {
  startEditing: () => void
}

type EditableTitleProps = {
  canEdit?: boolean
  /** Start editing when the title is clicked. Disable it where a tap can easily be accidental. */
  editOnClick?: boolean
  /** Lets the parent start editing, e.g. from a "Rename" menu item. */
  actionsRef?: Ref<EditableTitleActions>
  order: TitleOrder
  value: string
  onSave: (value: string) => Promise<void> | void
}

export function EditableTitle({
  canEdit,
  editOnClick = true,
  actionsRef,
  order,
  value,
  onSave
}: EditableTitleProps) {
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

  useImperativeHandle(actionsRef, () => ({ startEditing }), [startEditing])

  const clickToEdit = canEdit && editOnClick

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
          e.stopPropagation()
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            save()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            save()
          } else if (e.key === 'Escape') {
            cancel()
          }
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
      {...(clickToEdit ? { onClick: startEditing } : {})}
      style={{
        display: 'inline-block',
        cursor: clickToEdit ? 'text' : 'default',
        padding: '2px 6px 0px 6px',
        borderRadius: 6,
        border: '1px solid transparent',
        transition: 'border-color 150ms'
      }}
      onPointerEnter={e => {
        if (!clickToEdit || !isMousePointer(e)) return
        e.currentTarget.style.borderColor =
          colorScheme === 'dark' ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-4)'
      }}
      onPointerLeave={e => {
        if (!clickToEdit) return
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      {value}
    </Title>
  )
}
