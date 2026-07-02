'use client';

import { TextInput, Title, useComputedColorScheme } from '@mantine/core';
import { useRef, useState } from 'react';

type EditableTitleProps = {
  value: string;
  onSave: (value: string) => Promise<void> | void;
};

export function EditableTitle({ value, onSave }: EditableTitleProps) {
  const colorScheme = useComputedColorScheme();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft(value);
    setEditing(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const save = async () => {
    const trimmed = draft.trim();

    if (trimmed && trimmed !== value) {
      await onSave(trimmed);
    }

    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <TextInput
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        variant="unstyled"
        styles={{
          root: {
            margin: 0,
          },

          wrapper: {
            margin: 0,
          },

          input: {
            padding: '2px 6px',
            margin: 0,
            height: 'auto',
            minHeight: 0,

            fontSize: 'var(--mantine-h1-font-size)',
            fontWeight: 'var(--mantine-h1-font-weight)',
            lineHeight: 'var(--mantine-h1-line-height)',

            fontFamily: 'inherit',

            border: 0,
            background: 'transparent',
          },
        }}
      />
    );
  }

  return (
    <Title
      order={2}
      onClick={startEditing}
      style={{
        display: 'inline-block',
        cursor: 'text',
        padding: '8px 0px 2px 6px',
        borderRadius: 6,
        border: '1px solid transparent',
        transition: 'border-color 150ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor =
          colorScheme === 'dark'
            ? 'var(--mantine-color-dark-4)'
            : 'var(--mantine-color-gray-4)';
      }}

      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {value}
    </Title>
  );
}