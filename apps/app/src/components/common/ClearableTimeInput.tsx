'use client'

import { forwardRef } from 'react'
import { Input } from '@mantine/core'
import { TimeInput, TimeInputProps } from '@mantine/dates'
import { useTranslations } from 'next-intl'

type ClearableTimeInputProps = Omit<TimeInputProps, 'value' | 'onChange'> & {
  /** 'HH:MM' (seconds are ignored) or null */
  value: string | null
  onChange: (value: string | null) => void
}

/**
 * TimeInput (native time field: the system time picker on phones) with the same clear button
 * as Mantine's clearable inputs. Mantine's own TimePicker is clearable, but it replaces the
 * native picker.
 */
export const ClearableTimeInput = forwardRef<HTMLInputElement, ClearableTimeInputProps>(
  function ClearableTimeInput({ value, onChange, disabled, ...props }, ref) {
    const t = useTranslations('Common')
    const time = value?.slice(0, 'HH:MM'.length) ?? ''

    return (
      <TimeInput
        ref={ref}
        {...props}
        disabled={Boolean(disabled)}
        value={time}
        onChange={event => onChange(event.currentTarget.value || null)}
        rightSectionPointerEvents="all"
        rightSection={
          time && !disabled ? (
            <Input.ClearButton aria-label={t('clear')} onClick={() => onChange(null)} />
          ) : undefined
        }
      />
    )
  }
)
