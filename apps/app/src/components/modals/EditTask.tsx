'use client'

import { useMemo, useState } from 'react'
import { ActionIcon, FocusTrap, Group, Stack } from '@mantine/core'
import dayjs from 'dayjs'
import { ContextModalProps } from '@mantine/modals'
import { PlannedTask } from '@/models/task'
import { getPriorityColor } from '@/utils/color'
import { useTaskFieldUpdate } from '@/hooks/useTaskFieldUpdate'
import { useTaskCompletion } from '@/hooks/useTaskCompletion'
import { useTaskEditForm } from '@/hooks/useTsaskEditorForm'
import TaskBreadcrumb from '../task/TaskBreadcrumb'
import TaskContent from '../task/TaskContent'
import TaskDueDateField from '../task/TaskDueDateField'
import TaskPriorityField from '../task/TaskPriorityField'
import { IconX } from '@tabler/icons-react'

export type NavigationCallbacks = {
  onOpenList: () => void
  onOpenSection: () => void
}

type EditTaskProps = {
  task: PlannedTask
  canEdit: boolean | undefined
  navigation: NavigationCallbacks
}

export default function EditTask({ context, id, innerProps }: ContextModalProps<EditTaskProps>) {
  const { task, canEdit, navigation } = innerProps

  const { updateField } = useTaskFieldUpdate(task)
  const { completed, toggle } = useTaskCompletion(task)
  const editForm = useTaskEditForm(task)

  const [selectedDate, setSelectedDate] = useState<string | null>(
    task.dueDate ? dayjs(task.dueDate).toISOString() : null
  )
  const [selectedPriority, setSelectedPriority] = useState<string | null>(task.priority)

  const color = useMemo(() => getPriorityColor(task.priority), [task.priority])

  const handleDateChange = (date: string | null) => {
    setSelectedDate(date)
    updateField({ dueDate: date ? new Date(date) : null })
  }

  const handlePriorityChange = (priority: string | null) => {
    setSelectedPriority(priority)
    updateField({ priority: priority ?? null })
  }

  const handleNavigateToList = () => {
    navigation.onOpenList()
    context.closeModal(id)
  }

  const handleNavigateToSection = () => {
    navigation.onOpenSection()
    context.closeModal(id)
  }

  return (
    <Stack h="100%">
      <FocusTrap.InitialFocus />
      <Group
        justify='space-between'
        align='center'
        style={{
          borderBottom: '2px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))'
        }}
        pb={'sm'}
        >
        <TaskBreadcrumb
          listTitle={task.listTitle}
          sectionTitle={task.sectionTitle ?? ''}
          onOpenList={handleNavigateToList}
          onOpenSection={handleNavigateToSection}
        />
        <ActionIcon variant="subtle" onClick={() => context.closeModal(id)}>
          <IconX />
        </ActionIcon>
      </Group>

      <TaskContent
        completed={completed}
        onToggle={toggle}
        canEdit={canEdit ?? false}
        color={color}
        hasDescription={Boolean(task.description)}
        isEditing={editForm.isEditing}
        title={editForm.title}
        description={editForm.description}
        onTitleChange={editForm.setTitle}
        onDescriptionChange={editForm.setDescription}
        onStartEditing={editForm.startEditing}
        onSave={editForm.save}
        onCancel={editForm.cancel}
      />

      <TaskDueDateField date={selectedDate} canEdit={canEdit ?? false} onChange={handleDateChange} />

      <TaskPriorityField priority={selectedPriority} canEdit={canEdit ?? false} onChange={handlePriorityChange} />

      {/* Future: <TaskAssigneeField />, <TaskTimeRangeField />, <TaskRecurrenceField /> — same shape */}
    </Stack>
  )
}