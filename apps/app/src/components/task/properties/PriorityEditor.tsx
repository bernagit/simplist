'use client'

import { IconFlag, IconFlagOff } from '@tabler/icons-react'
import { usePriorityOptions } from '@/hooks/useOptionLabel'
import { getPriorityColor } from '@/utils/color'
import { OptionList } from './OptionList'

type PriorityEditorProps = {
  value: string | null
  onChange: (priority: string | null) => void
  onDone: () => void
}

export function PriorityEditor({ value, onChange, onDone }: PriorityEditorProps) {
  const options = usePriorityOptions()

  return (
    <OptionList
      items={options.map(option => ({
        key: option.value ?? 'none',
        label: option.label,
        selected: value === option.value,
        icon: option.value ? (
          <IconFlag size={18} color={getPriorityColor(option.value)} />
        ) : (
          <IconFlagOff size={18} color="var(--mantine-color-dimmed)" />
        ),
        onSelect: () => {
          onChange(option.value)
          onDone()
        }
      }))}
    />
  )
}
