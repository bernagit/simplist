'use client'

import { useEffect, useRef, useState } from 'react'
import { ActionIcon, Box, FocusTrap, Group, Stack, Text } from '@mantine/core'
import { ContextModalProps } from '@mantine/modals'
import { IconLock, IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { PlannedTask, TaskProperties } from '@/models/task'
import { getPriorityColor } from '@/utils/color'
import { useTaskFieldUpdate } from '@/hooks/useTaskFieldUpdate'
import { useTaskCompletion } from '@/hooks/useTaskCompletion'
import { useTaskEditForm } from '@/hooks/useTaskEditorForm'
import { useDevice } from '@/hooks/useDevice'
import TaskBreadcrumb from '../task/TaskBreadcrumb'
import TaskContent from '../task/TaskContent'
import { TaskPropertiesEditor } from '../task/properties/TaskPropertiesEditor'

export type NavigationCallbacks = {
  onOpenList: () => void
  onOpenSection: () => void
}

type EditTaskProps = {
  task: PlannedTask
  canEdit: boolean | undefined
  navigation: NavigationCallbacks
  onUpdate?: (updatedTask: PlannedTask) => void
}

const PANEL_WIDTH = 300

export default function EditTask({ context, id, innerProps }: ContextModalProps<EditTaskProps>) {
  const { task, canEdit = false, navigation, onUpdate } = innerProps
  const t = useTranslations('EditTask')
  const { isMobile } = useDevice()

  // One draft for the whole modal: every change is saved and reported with all previous ones
  const [draft, setDraft] = useState<PlannedTask>(task)
  const { updateField } = useTaskFieldUpdate(task)
  const { completed, toggle } = useTaskCompletion(task)

  const commit = (next: PlannedTask) => {
    setDraft(next)
    onUpdate?.(next)
  }

  const patch = (updates: Partial<PlannedTask>) => {
    commit({ ...draft, ...updates })
    void updateField(updates)
  }

  const editForm = useTaskEditForm(task, patch)

  // Closing the modal (click outside, Escape, back) while editing the title or description
  // saves the edit instead of dropping it
  const pendingEdit = useRef<(() => void) | null>(null)
  useEffect(() => {
    pendingEdit.current = editForm.isEditing ? editForm.save : null
  })
  useEffect(() => () => pendingEdit.current?.(), [])

  const handleToggle = async () => {
    const saved = await toggle()
    if (!saved) return
    // A recurring task comes back open, with its next date
    commit({ ...draft, ...saved })
  }

  const close = () => context.closeModal(id)

  return (
    <Stack h="100%" gap="md">
      <FocusTrap.InitialFocus />

      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Box miw={0}>
          <TaskBreadcrumb
            listTitle={draft.listTitle}
            sectionTitle={draft.sectionTitle ?? ''}
            onOpenList={() => {
              navigation.onOpenList()
              close()
            }}
            onOpenSection={() => {
              navigation.onOpenSection()
              close()
            }}
          />
        </Box>
        <Group gap={4} wrap="nowrap">
          {!canEdit && (
            <Group gap={4} c="dimmed" wrap="nowrap">
              <IconLock size={14} />
              <Text size="xs">{t('readOnly')}</Text>
            </Group>
          )}
          <ActionIcon variant="subtle" color="gray" aria-label={t('close')} onClick={close}>
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <Box
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 'var(--mantine-spacing-lg)',
          alignItems: 'stretch'
        }}
      >
        <Box flex={1} miw={0} py={isMobile ? 0 : 'xs'}>
          <TaskContent
            completed={completed}
            onToggle={handleToggle}
            canEdit={canEdit}
            color={getPriorityColor(draft.priority)}
            isEditing={editForm.isEditing}
            title={editForm.title}
            description={editForm.description}
            onTitleChange={editForm.setTitle}
            onDescriptionChange={editForm.setDescription}
            onStartEditing={editForm.startEditing}
            onSave={editForm.save}
            onCancel={editForm.cancel}
          />
        </Box>

        <Box
          w={isMobile ? '100%' : PANEL_WIDTH}
          p="xs"
          style={{
            flexShrink: 0,
            borderRadius: 'var(--mantine-radius-md)',
            backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
            border: '1px solid var(--mantine-color-default-border)'
          }}
        >
          <TaskPropertiesEditor
            variant="row"
            value={draft}
            canEdit={canEdit}
            onChange={(updates: Partial<TaskProperties>) => patch(updates)}
          />
        </Box>
      </Box>
    </Stack>
  )
}
