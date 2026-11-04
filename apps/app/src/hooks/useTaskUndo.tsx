'use client'

import { useCallback } from 'react'
import { Button, Group, Text } from '@mantine/core'
import { hideNotification, showNotification } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import dayjs from 'dayjs'
import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { Task } from '@/models/task'
import { invalidateListsOverview, listKeys } from '@/queries/lists'
import { plannedTaskKeys, useToggleTask, useUpdateTask } from '@/queries/task'
import { tasksService } from '@/services/task'
import { pendingDeletes } from '@/lib/pendingDeletes'

/** How long "Undo" stays available */
export const UNDO_WINDOW_MS = 5000

function showUndo(id: string, message: string, undoLabel: string, onUndo: () => void) {
  showNotification({
    id,
    autoClose: UNDO_WINDOW_MS,
    withCloseButton: false,
    message: (
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Text size="sm" style={{ minWidth: 0 }} truncate>
          {message}
        </Text>
        <Button
          size="compact-sm"
          variant="subtle"
          onClick={() => {
            hideNotification(id)
            onUndo()
          }}
        >
          {undoLabel}
        </Button>
      </Group>
    )
  })
}

/**
 * Delete with undo: the task disappears at once, the request is sent when the undo window ends
 * (or right away if the page is closed or hidden). Undo puts the task back where it was.
 */
export function useUndoableDelete() {
  const queryClient = useQueryClient()
  const t = useTranslations('TaskRow')

  return useCallback(
    async (task: Task) => {
      const key = listKeys.detail(task.listId)
      await queryClient.cancelQueries({ queryKey: key })

      const index = queryClient
        .getQueryData<Resp<CompleteList>>(key)
        ?.data.tasks.findIndex(item => item.id === task.id)

      queryClient.setQueryData<Resp<CompleteList>>(key, old =>
        old
          ? {
              ...old,
              data: { ...old.data, tasks: old.data.tasks.filter(item => item.id !== task.id) }
            }
          : old
      )

      const commit = (closing = false) => {
        tasksService
          .deleteTask(task.id, { keepalive: closing })
          .catch(() => {
            // Not deleted after all (offline, no permission...): show it again
            void queryClient.invalidateQueries({ queryKey: key })
          })
          .finally(() => {
            void queryClient.invalidateQueries({ queryKey: plannedTaskKeys.all })
            void invalidateListsOverview(queryClient)
          })
      }
      pendingDeletes.schedule(task.id, UNDO_WINDOW_MS, commit)

      showUndo(`task-undo-${task.id}`, t('deleted', { title: task.title }), t('undo'), () => {
        if (!pendingDeletes.cancel(task.id)) return
        queryClient.setQueryData<Resp<CompleteList>>(key, old => {
          if (!old || old.data.tasks.some(item => item.id === task.id)) return old
          const tasks = [...old.data.tasks]
          tasks.splice(index === undefined || index < 0 ? tasks.length : index, 0, task)
          return { ...old, data: { ...old.data, tasks } }
        })
      })
    },
    [queryClient, t]
  )
}

/**
 * Tick from a task row, with undo. Undo writes back the previous state instead of toggling
 * again: a recurring task gets its previous date (and remaining count) back.
 */
export function useUndoableToggle() {
  const toggleTask = useToggleTask()
  const updateTask = useUpdateTask()
  const t = useTranslations('TaskRow')

  return useCallback(
    async (task: Task) => {
      const response = await toggleTask.mutateAsync({
        listId: task.listId,
        taskId: task.id,
        quiet: true
      })
      const saved = response.data

      // Reopening a done task is easy to redo by hand: no undo needed
      if (task.completed) return

      const rescheduled = !saved.completed && saved.dueDate !== task.dueDate
      const message = rescheduled
        ? t('rescheduled', { date: dayjs(saved.dueDate).format('ddd D MMM') })
        : t('completed', { title: task.title })

      showUndo(`task-undo-${task.id}`, message, t('undo'), () => {
        updateTask.mutate({
          listId: task.listId,
          taskId: task.id,
          updates: rescheduled
            ? { dueDate: task.dueDate, recurrenceRule: task.recurrenceRule, completed: false }
            : { completed: false }
        })
      })
    },
    [toggleTask, updateTask, t]
  )
}
