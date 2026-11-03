'use client'

import { forwardRef, KeyboardEvent, ReactNode } from 'react'
import { ActionIcon, Button, Group, Text } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useDevice } from '@/hooks/useDevice'
import classes from './PropertyTrigger.module.css'

export type PropertyTriggerProps = {
  /** 'chip': compact button (add task); 'row': labelled row (task details) */
  variant: 'chip' | 'row'
  icon: ReactNode
  label: string
  /** Shown text; null = not set */
  value: string | null
  /** Color of the value (e.g. priority, overdue date) */
  color?: string | undefined
  active?: boolean
  disabled?: boolean
  onClick: () => void
  /** Shows a clear button when the value is set */
  onClear?: (() => void) | undefined
}

/** How a task property looks before its picker opens: same data, two densities. */
export const PropertyTrigger = forwardRef<HTMLDivElement, PropertyTriggerProps>(
  function PropertyTrigger(
    { variant, icon, label, value, color, active, disabled, onClick, onClear },
    ref
  ) {
    const t = useTranslations('TaskProperties')
    const { isTouch } = useDevice()
    const isSet = value !== null
    const clearLabel = t('clear', { property: label })

    if (variant === 'chip') {
      const height = isTouch ? 34 : 28
      return (
        <div ref={ref} style={{ display: 'inline-flex' }}>
          <Button.Group>
            <Button
              variant={isSet ? 'light' : 'default'}
              {...(isSet ? { color: 'gray' } : {})}
              size="compact-sm"
              h={height}
              radius="md"
              disabled={Boolean(disabled)}
              leftSection={icon}
              onClick={onClick}
              styles={{ label: { fontWeight: 500, color: isSet ? color : undefined } }}
            >
              {value ?? label}
            </Button>
            {isSet && onClear && !disabled && (
              <Button
                variant="light"
                color="gray"
                size="compact-sm"
                h={height}
                px={6}
                radius="md"
                aria-label={clearLabel}
                onClick={onClear}
              >
                <IconX size={14} />
              </Button>
            )}
          </Button.Group>
        </div>
      )
    }

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick()
      }
    }

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={classes.row}
        data-disabled={disabled || undefined}
        data-active={active || undefined}
        data-touch={isTouch || undefined}
        onClick={() => !disabled && onClick()}
        onKeyDown={onKeyDown}
      >
        <Group gap={8} wrap="nowrap" className={classes.label}>
          <span style={{ display: 'flex', color: 'var(--mantine-color-dimmed)' }}>{icon}</span>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
        </Group>
        <Text
          size="sm"
          fw={isSet ? 500 : 400}
          c={isSet ? (color ?? 'var(--mantine-color-text)') : 'dimmed'}
          className={classes.value}
          truncate
        >
          {value ?? (disabled ? '—' : t('notSet'))}
        </Text>
        {isSet && onClear && !disabled && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            className={classes.clear}
            aria-label={clearLabel}
            onClick={event => {
              event.stopPropagation()
              onClear()
            }}
          >
            <IconX size={14} />
          </ActionIcon>
        )}
      </div>
    )
  }
)
