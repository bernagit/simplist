import { CreateTaskInput, UpdateTaskInput } from '@/models/task'
import { tasksService } from '@/services/task'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listKeys } from './lists'
import { CompleteList } from '@/models/lists'
import { Resp } from '@/models/base'
import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import { createTempId } from '@/utils/common'

export function useCreateTask() {
  const queryClient = useQueryClient()
  const [tempId] = useState(() => createTempId());
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksService.createTask(input),

    onMutate: async input => {
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
                order: old.data.tasks.length,
                ...input
              }
            ]
          }
        }
      })

      return { previousList }
    },

    onSuccess: (response, variables) => {
      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(variables.listId), old => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map(task => (task.id === tempId ? response.data : task))
          }
        }
      })
    },

    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(variables.listId), context.previousList)
      }
    }
  })
}

type ToggleTaskInput = {
  listId: string
  taskId: string
}

export function useToggleTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: ToggleTaskInput) => tasksService.toggleCompleteTask(taskId),

    onMutate: async ({ listId, taskId }) => {
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
              task.id === taskId ? { ...task, completed: !task.completed } : task
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
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { listId: string; taskId: string }) => tasksService.deleteTask(taskId),

    onMutate: async ({ listId, taskId }) => {
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
            tasks: old.data.tasks.filter(task => task.id !== taskId)
          }
        }
      })

      return { previousList }
    },

    onError: (_error, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(listId), context.previousList)
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
      targetTaskId: string | undefined
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

        const allTasks = [...old.data.tasks]
        const isSameSection = input.sourceSectionId === input.targetSectionId

        if (isSameSection) {
          const sectionTasks = allTasks
            .filter(t => t.sectionId === input.sourceSectionId)
            .sort((a, b) => a.order - b.order)

          const oldIndex = sectionTasks.findIndex(t => t.id === input.movedTaskId)
          const newIndex = input.targetTaskId
            ? sectionTasks.findIndex(t => t.id === input.targetTaskId)
            : sectionTasks.length - 1

          if (oldIndex === -1 || newIndex === -1) return old

          const reordered = arrayMove(sectionTasks, oldIndex, newIndex).map((task, index) => ({
            ...task,
            order: index
          }))

          return {
            ...old,
            data: {
              ...old.data,
              tasks: allTasks.map(task => {
                const updated = reordered.find(t => t.id === task.id)
                return updated ?? task
              })
            }
          }
        } else {
          const movedTask = allTasks.find(t => t.id === input.movedTaskId)
          if (!movedTask) return old

          // 1. Remove moved task from source section tasks & adjust order
          const sourceTasks = allTasks
            .filter(t => t.sectionId === input.sourceSectionId && t.id !== input.movedTaskId)
            .sort((a, b) => a.order - b.order)
            .map((t, idx) => ({ ...t, order: idx }))

          // 2. Prepare target section tasks & insert moved task
          const targetTasks = allTasks
            .filter(t => t.sectionId === input.targetSectionId)
            .sort((a, b) => a.order - b.order)

          const insertIndex = input.targetTaskId
            ? targetTasks.findIndex(t => t.id === input.targetTaskId)
            : targetTasks.length

          const updatedMovedTask = {
            ...movedTask,
            sectionId: input.targetSectionId
          }

          targetTasks.splice(insertIndex === -1 ? targetTasks.length : insertIndex, 0, updatedMovedTask)

          const reorderedTargetTasks = targetTasks.map((t, idx) => ({
            ...t,
            order: idx
          }))

          // Combine source, target, and unaffected tasks
          const affectedIds = new Set([
            ...sourceTasks.map(t => t.id),
            ...reorderedTargetTasks.map(t => t.id)
          ])

          const unaffectedTasks = allTasks.filter(t => !affectedIds.has(t.id))

          return {
            ...old,
            data: {
              ...old.data,
              tasks: [...unaffectedTasks, ...sourceTasks, ...reorderedTargetTasks]
            }
          }
        }
      })

      return { previousList }
    },

    onSuccess: ({ data: updatedTasks }, variables) => {
      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(variables.listId), old => {
        if (!old) return old

        const updatedMap = new Map(updatedTasks.map(t => [t.id, t]))

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map(task => updatedMap.get(task.id) ?? task)
          }
        }
      })
    },

    onError: (_err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(variables.listId), context.previousList)
      }
    }
  })
}

export function usePlannedTasks(startDate: Date, endDate: Date, listId?: string) {
  return useQuery({
    queryKey: ['plannedTasks', startDate.toISOString(), endDate.toISOString(), listId],
    queryFn: () => tasksService.getPlannedTasks(startDate, endDate, listId)
  })
}
