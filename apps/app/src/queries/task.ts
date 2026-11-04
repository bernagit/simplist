import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { CreateTaskInput, Task, UpdateTaskInput } from '@/models/task'
import { tasksService } from '@/services/task'
import { createTempId } from '@/utils/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LexoRank } from 'lexorank'
import { invalidateListsOverview, listKeys } from './lists'
import { showNotification } from '@mantine/notifications'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksService.createTask(input),

    onMutate: async input => {
      const tempId = createTempId()

      await queryClient.cancelQueries({
        queryKey: listKeys.detail(input.listId)
      })

      const previousList = queryClient.getQueryData<Resp<CompleteList>>(
        listKeys.detail(input.listId)
      )

      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(input.listId), old => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            tasks: [
              ...old.data.tasks,
              {
                id: tempId,
                creatorId: '',
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                order: '',
                ...input
              }
            ]
          }
        }
      })

      return { previousList, tempId }
    },

    onSuccess: (response, variables, context) => {
      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(variables.listId), old => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map(task => (task.id === context?.tempId ? response.data : task))
          }
        }
      })
    },

    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(variables.listId), context.previousList)
      }
    },

    onSettled: () => {
      void invalidateListsOverview(queryClient)
    }
  })
}

type ToggleTaskInput = {
  listId: string
  taskId: string
  /** The caller shows its own feedback (task rows, with undo) */
  quiet?: boolean
}

export const plannedTaskKeys = {
  all: ['plannedTasks'] as const
}

/** Completing an open recurring task with a date reschedules it instead of closing it. */
export function isRecurringOccurrence(
  task: Pick<Task, 'completed' | 'recurrenceRule' | 'dueDate'>
) {
  return !task.completed && Boolean(task.recurrenceRule) && Boolean(task.dueDate)
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  const t = useTranslations('TaskRow')

  return useMutation({
    mutationFn: ({ taskId }: ToggleTaskInput) => tasksService.toggleCompleteTask(taskId),

    onMutate: async ({ listId, taskId }) => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(listId)
      })

      const previousList = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(listId))

      // Recurring tasks get their next date from the server: no optimistic tick for them
      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(listId), old => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map(task =>
              task.id === taskId && !isRecurringOccurrence(task)
                ? { ...task, completed: !task.completed }
                : task
            )
          }
        }
      })

      return { previousList }
    },

    onSuccess: (response, { listId, taskId, quiet }, context) => {
      const updated = response.data
      const before = context?.previousList?.data.tasks.find(task => task.id === taskId)

      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(listId), old => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map(task => (task.id === taskId ? { ...task, ...updated } : task))
          }
        }
      })

      if (!quiet && updated.dueDate && before?.dueDate !== updated.dueDate && !updated.completed) {
        showNotification({
          message: t('rescheduled', { date: dayjs(updated.dueDate).format('ddd D MMM') }),
          color: 'teal'
        })
      }
    },

    onError: (_error, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(listId), context.previousList)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: plannedTaskKeys.all })
      void invalidateListsOverview(queryClient)
    }
  })
}

type UpdateTaskVariables = {
  taskId: string
  listId: string
  updates: Partial<UpdateTaskInput>
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, updates }: UpdateTaskVariables) =>
      tasksService.updateTask(taskId, updates),

    onMutate: async ({ taskId, listId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(listId)
      })

      const previousList = queryClient.getQueryData<Resp<CompleteList>>(listKeys.detail(listId))

      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(listId), old => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map(task =>
              task.id === taskId
                ? {
                    ...task,
                    ...updates,
                    updatedAt: new Date()
                  }
                : task
            )
          }
        }
      })

      return { previousList }
    },

    onError: (_error, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(listId), context.previousList)
      }
    },

    onSettled: (_data, _error, { updates }) => {
      // Only completion changes the counts
      if ('completed' in updates) void invalidateListsOverview(queryClient)
      if ('dueDate' in updates || 'completed' in updates) {
        void queryClient.invalidateQueries({ queryKey: plannedTaskKeys.all })
      }
    }
  })
}

export function useReorderTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      listId: string
      sourceSectionId: string
      targetSectionId: string
      movedTaskId: string
      prevTaskId: string | undefined
      nextTaskId: string | undefined
    }) => tasksService.reorderTasks(input),

    onMutate: async input => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(input.listId)
      })

      const previousList = queryClient.getQueryData<Resp<CompleteList>>(
        listKeys.detail(input.listId)
      )

      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(input.listId), old => {
        if (!old) return old

        const prevTask = old.data.tasks.find(t => t.id === input.prevTaskId)
        const nextTask = old.data.tasks.find(t => t.id === input.nextTaskId)

        const prevRank = prevTask?.order ? LexoRank.parse(prevTask.order) : null
        const nextRank = nextTask?.order ? LexoRank.parse(nextTask.order) : null

        let newOrderStr: string
        if (prevRank && nextRank) {
          newOrderStr = prevRank.between(nextRank).toString()
        } else if (prevRank) {
          newOrderStr = prevRank.genNext().toString()
        } else if (nextRank) {
          newOrderStr = nextRank.genPrev().toString()
        } else {
          newOrderStr = LexoRank.middle().toString()
        }

        const updatedTasks = old.data.tasks.map(task =>
          task.id === input.movedTaskId
            ? { ...task, sectionId: input.targetSectionId, order: newOrderStr }
            : task
        )

        return {
          ...old,
          data: {
            ...old.data,
            tasks: updatedTasks
          }
        }
      })

      return { previousList }
    },

    onError: (_err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(variables.listId), context.previousList)
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(variables.listId)
      })
    }
  })
}

export function usePlannedTasks(startDate: Date, endDate: Date, listId?: string) {
  return useQuery({
    queryKey: [...plannedTaskKeys.all, startDate.toISOString(), endDate.toISOString(), listId],
    queryFn: () => tasksService.getPlannedTasks(startDate, endDate, listId)
  })
}
