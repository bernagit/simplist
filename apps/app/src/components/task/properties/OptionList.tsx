'use client'

import { ReactNode } from 'react'
import { Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import classes from './PropertyTrigger.module.css'

export type OptionItem = {
  key: string
  label: string
  description?: string | undefined
  icon?: ReactNode
  selected?: boolean
  onSelect: () => void
}

/** Single-choice list used by the priority and repeat pickers */
export function OptionList({ items }: { items: OptionItem[] }) {
  return (
    <Stack gap={2} role="listbox">
      {items.map(item => (
        <UnstyledButton
          key={item.key}
          role="option"
          aria-selected={item.selected}
          className={classes.row}
          data-active={item.selected || undefined}
          onClick={item.onSelect}
          style={{ minHeight: 40 }}
        >
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            {item.icon}
            <div style={{ minWidth: 0 }}>
              <Text size="sm" fw={item.selected ? 600 : 400}>
                {item.label}
              </Text>
              {item.description && (
                <Text size="xs" c="dimmed">
                  {item.description}
                </Text>
              )}
            </div>
          </Group>
          {item.selected && <IconCheck size={16} color="var(--mantine-primary-color-filled)" />}
        </UnstyledButton>
      ))}
    </Stack>
  )
}
