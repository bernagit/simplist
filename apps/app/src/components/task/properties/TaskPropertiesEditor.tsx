'use client'

import { Group, Stack } from '@mantine/core'
import { IconBell, IconCalendar, IconFlag, IconRepeat } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { TaskProperties } from '@/models/task'
import {
  isOverdue,
  useDueDateLabel,
  useDurationLabel,
  usePriorityOptions,
  useRecurrenceLabel,
  useReminderLabel
} from '@/hooks/useOptionLabel'
import { getPriorityColor } from '@/utils/color'
import {
  useNotificationConfig,
  useNotificationDevices,
  useNotificationSettings
} from '@/queries/notifications'
import { ResponsivePicker } from './ResponsivePicker'
import { PropertyTrigger } from './PropertyTrigger'
import { DateEditor } from './DateEditor'
import { RecurrenceEditor } from './RecurrenceEditor'
import { ReminderEditor, ReminderStatus } from './ReminderEditor'
import { PriorityEditor } from './PriorityEditor'

type TaskPropertiesEditorProps = {
  /** 'chip': compact row of buttons (add task); 'row': labelled list (task details) */
  variant: 'chip' | 'row'
  value: TaskProperties
  onChange: (patch: Partial<TaskProperties>) => void
  canEdit?: boolean
}

/** Without a date there is nothing to repeat or to be reminded of */
const CLEAR_DATE: Partial<TaskProperties> = {
  dueDate: null,
  dueTime: null,
  durationMinutes: null,
  recurrenceRule: null,
  reminderEnabled: false
}

/**
 * Date, repeat, reminder and priority of a task: the same pickers and rules everywhere a task
 * is created or edited. `onChange` receives only the fields that changed.
 */
export function TaskPropertiesEditor({
  variant,
  value,
  onChange,
  canEdit = true
}: TaskPropertiesEditorProps) {
  const t = useTranslations('TaskProperties')
  const dateLabel = useDueDateLabel()
  const durationLabel = useDurationLabel()
  const recurrenceLabel = useRecurrenceLabel()
  const reminderLabel = useReminderLabel()
  const priorityOptions = usePriorityOptions()

  const { data: config } = useNotificationConfig()
  const pushAvailable = config?.data.enabled ?? false
  const { data: settings } = useNotificationSettings(pushAvailable)
  const { data: devices } = useNotificationDevices(pushAvailable && value.reminderEnabled)
  const reminderStatus: ReminderStatus = !config
    ? 'ready'
    : !pushAvailable
      ? 'unavailable'
      : settings && (!settings.data.enabled || devices?.data.length === 0)
        ? 'off'
        : 'ready'

  const hasDate = value.dueDate !== null
  const compact = variant === 'chip'

  const dateText = hasDate
    ? [
        dateLabel(value.dueDate, value.dueTime),
        !compact && value.durationMinutes ? durationLabel(value.durationMinutes) : null
      ]
        .filter(Boolean)
        .join(' · ')
    : null
  const priority = priorityOptions.find(option => option.value === value.priority && option.value)

  const pickers = [
    {
      key: 'date',
      show: true,
      title: t('date.title'),
      icon: <IconCalendar size={16} />,
      label: t('date.label'),
      value: dateText,
      color: isOverdue(value.dueDate, value.dueTime) ? 'var(--mantine-color-red-6)' : undefined,
      disabled: false,
      onClear: () => onChange(CLEAR_DATE),
      width: 320,
      editor: (close: () => void) => (
        <DateEditor value={value} onChange={onChange} onDone={close} />
      )
    },
    {
      key: 'recurrence',
      // Chips stay short: repeat and reminder appear once there is a date
      show: !compact || hasDate,
      title: t('recurrence.title'),
      icon: <IconRepeat size={16} />,
      label: t('recurrence.label'),
      value: value.recurrenceRule ? recurrenceLabel(value.recurrenceRule, value.dueDate) : null,
      color: undefined,
      disabled: !hasDate,
      onClear: () => onChange({ recurrenceRule: null }),
      width: 320,
      editor: (close: () => void) => (
        <RecurrenceEditor
          rule={value.recurrenceRule}
          dueDate={value.dueDate}
          onChange={recurrenceRule => onChange({ recurrenceRule })}
          onDone={close}
        />
      )
    },
    {
      key: 'reminder',
      show: !compact || hasDate,
      title: t('reminder.title'),
      icon: <IconBell size={16} />,
      label: t('reminder.label'),
      value: value.reminderEnabled && hasDate ? reminderLabel(value, settings?.data) : null,
      color: undefined,
      disabled: !hasDate,
      onClear: () => onChange({ reminderEnabled: false }),
      width: 300,
      editor: () => (
        <ReminderEditor
          value={value}
          defaults={settings?.data}
          status={reminderStatus}
          onChange={onChange}
        />
      )
    },
    {
      key: 'priority',
      show: true,
      title: t('priority.title'),
      icon: <IconFlag size={16} color={value.priority ? getPriorityColor(value.priority) : undefined} />,
      label: t('priority.label'),
      value: priority ? priority.label : null,
      color: value.priority ? getPriorityColor(value.priority) : undefined,
      disabled: false,
      onClear: () => onChange({ priority: null }),
      width: 220,
      editor: (close: () => void) => (
        <PriorityEditor
          value={value.priority}
          onChange={priority => onChange({ priority })}
          onDone={close}
        />
      )
    }
  ]

  const items = pickers
    .filter(picker => picker.show)
    .map(picker => (
      <ResponsivePicker
        key={picker.key}
        title={picker.title}
        width={picker.width}
        disabled={!canEdit || picker.disabled}
        target={({ opened, toggle }) => (
          <PropertyTrigger
            variant={variant}
            icon={picker.icon}
            label={picker.label}
            value={picker.value}
            color={picker.color}
            active={opened}
            disabled={!canEdit || picker.disabled}
            onClick={toggle}
            onClear={canEdit ? picker.onClear : undefined}
          />
        )}
      >
        {picker.editor}
      </ResponsivePicker>
    ))

  return compact ? (
    <Group gap={6} wrap="wrap">
      {items}
    </Group>
  ) : (
    <Stack gap={2}>{items}</Stack>
  )
}
