'use client'

import { useState } from 'react'
import {
  Button,
  Chip,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconAdjustments, IconArrowLeft, IconRepeat, IconRepeatOff } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import {
  buildRecurrence,
  defaultRecurrence,
  Frequency,
  FREQUENCIES,
  matchPreset,
  parseRecurrence,
  Recurrence,
  RECURRENCE_PRESETS,
  RecurrencePreset,
  weekdayOf,
  WEEKDAYS,
  Weekday
} from '@/lib/recurrence'
import { useRecurrenceLabel, useWeekdayNames } from '@/hooks/useOptionLabel'
import { OptionList } from './OptionList'

const MAX_INTERVAL = 99
const MAX_COUNT = 999
const DEFAULT_COUNT = 10

type RecurrenceEditorProps = {
  rule: string | null
  dueDate: string | null
  onChange: (rule: string | null) => void
  onDone: () => void
}

export function RecurrenceEditor({ rule, dueDate, onChange, onDone }: RecurrenceEditorProps) {
  const t = useTranslations('TaskProperties.recurrence')
  const describe = useRecurrenceLabel()
  const preset = matchPreset(rule)
  const isCustom = rule !== null && preset === null
  const [editingCustom, setEditingCustom] = useState(false)

  if (editingCustom) {
    return (
      <CustomRecurrence
        initial={parseRecurrence(rule) ?? withDueWeekday(defaultRecurrence(), dueDate)}
        dueDate={dueDate}
        onBack={() => setEditingCustom(false)}
        onApply={value => {
          onChange(value)
          onDone()
        }}
      />
    )
  }

  const select = (value: string | null) => {
    onChange(value)
    onDone()
  }

  return (
    <OptionList
      items={[
        {
          key: 'none',
          label: t('none'),
          icon: <IconRepeatOff size={18} color="var(--mantine-color-dimmed)" />,
          selected: rule === null,
          onSelect: () => select(null)
        },
        ...(Object.keys(RECURRENCE_PRESETS) as RecurrencePreset[]).map(key => ({
          key,
          label: describe(RECURRENCE_PRESETS[key], dueDate),
          icon: <IconRepeat size={18} color="var(--mantine-color-dimmed)" />,
          selected: preset === key,
          onSelect: () => select(RECURRENCE_PRESETS[key])
        })),
        {
          key: 'custom',
          label: t('custom'),
          description: isCustom ? describe(rule, dueDate) : undefined,
          icon: <IconAdjustments size={18} color="var(--mantine-color-dimmed)" />,
          selected: isCustom,
          onSelect: () => setEditingCustom(true)
        }
      ]}
    />
  )
}

/** Weekly rules start from the due date's weekday, so the chips show something selected */
function withDueWeekday(recurrence: Recurrence, dueDate: string | null): Recurrence {
  return dueDate ? { ...recurrence, byDay: [weekdayOf(dueDate)] } : recurrence
}

function CustomRecurrence({
  initial,
  dueDate,
  onBack,
  onApply
}: {
  initial: Recurrence
  dueDate: string | null
  onBack: () => void
  onApply: (rule: string) => void
}) {
  const t = useTranslations('TaskProperties.recurrence')
  const describe = useRecurrenceLabel()
  const weekdayNames = useWeekdayNames()
  const [value, setValue] = useState<Recurrence>(initial)
  const update = (patch: Partial<Recurrence>) => setValue(current => ({ ...current, ...patch }))

  const unitOptions = FREQUENCIES.map(freq => ({
    value: freq,
    label: t(`units.${freq}`, { count: value.interval })
  }))

  const changeFrequency = (freq: Frequency) =>
    update(
      freq !== 'WEEKLY'
        ? { freq, byDay: [] }
        : value.byDay.length === 0 && dueDate
          ? { freq, byDay: [weekdayOf(dueDate)] }
          : { freq }
    )

  const toggleDay = (days: string[]) => update({ byDay: WEEKDAYS.filter(day => days.includes(day)) })

  // Weekly with only the due date's weekday is the same as no BYDAY: keep the rule short
  const normalized: Recurrence =
    value.freq === 'WEEKLY' &&
    dueDate &&
    value.byDay.length === 1 &&
    value.byDay[0] === weekdayOf(dueDate)
      ? { ...value, byDay: [] }
      : value
  const rule = buildRecurrence(normalized)

  const endType = value.end.type

  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="nowrap">
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          px={4}
          leftSection={<IconArrowLeft size={14} />}
          onClick={onBack}
        >
          {t('back')}
        </Button>
      </Group>

      <Group gap="xs" wrap="nowrap" align="center">
        <Text size="sm" style={{ flexShrink: 0 }}>
          {t('every')}
        </Text>
        <NumberInput
          w={70}
          min={1}
          max={MAX_INTERVAL}
          clampBehavior="strict"
          allowDecimal={false}
          value={value.interval}
          onChange={interval => update({ interval: Math.max(1, Number(interval) || 1) })}
        />
        <Select
          flex={1}
          allowDeselect={false}
          data={unitOptions}
          value={value.freq}
          onChange={freq => freq && changeFrequency(freq as Frequency)}
          comboboxProps={{ withinPortal: false }}
        />
      </Group>

      {value.freq === 'WEEKLY' && (
        <Chip.Group multiple value={value.byDay} onChange={toggleDay}>
          <Group gap={4} justify="space-between">
            {WEEKDAYS.map((day: Weekday) => (
              <Chip key={day} value={day} size="xs" radius="xl" variant="light">
                {weekdayNames[day]}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      )}

      <Stack gap={6}>
        <Text size="sm">{t('ends')}</Text>
        <SegmentedControl
          fullWidth
          size="xs"
          value={endType}
          onChange={type =>
            update({
              end:
                type === 'count'
                  ? { type: 'count', count: DEFAULT_COUNT }
                  : type === 'until'
                    ? {
                        type: 'until',
                        until: dayjs(dueDate ?? undefined)
                          .add(1, 'month')
                          .format('YYYY-MM-DD')
                      }
                    : { type: 'never' }
            })
          }
          data={[
            { value: 'never', label: t('endNever') },
            { value: 'until', label: t('endOn') },
            { value: 'count', label: t('endAfter') }
          ]}
        />
        {value.end.type === 'until' && (
          <DatePickerInput
            value={value.end.until}
            {...(dueDate ? { minDate: dueDate } : {})}
            onChange={until => until && update({ end: { type: 'until', until } })}
            popoverProps={{ withinPortal: false }}
          />
        )}
        {value.end.type === 'count' && (
          <NumberInput
            min={1}
            max={MAX_COUNT}
            clampBehavior="strict"
            allowDecimal={false}
            value={value.end.count}
            suffix={` ${t('occurrences', { count: value.end.count })}`}
            onChange={count => update({ end: { type: 'count', count: Math.max(1, Number(count) || 1) } })}
          />
        )}
      </Stack>

      <Text size="xs" c="dimmed">
        {describe(rule, dueDate)}
      </Text>

      <Group justify="flex-end" gap="xs">
        <Button
          size="compact-sm"
          disabled={value.freq === 'WEEKLY' && value.byDay.length === 0 && !dueDate}
          onClick={() => onApply(rule)}
        >
          {t('apply')}
        </Button>
      </Group>
    </Stack>
  )
}
