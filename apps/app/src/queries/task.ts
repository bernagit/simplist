import { CreateTaskInput, UpdateTaskInput } from '@/models/task'
import { tasksService } from '@/services/task'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listKeys } from './lists'
import { CompleteList } from '@/models/lists'
import { Resp } from '@/models/base'

export function useCreateTask() {
  const queryClient = useQueryClient()

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
                id: 'temp-id',
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
            tasks: old.data.tasks.map(task => (task.id === 'temp-id' ? response.data : task))
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
        queryKey: listKeys.detail(listId),
      })

      const previousList =
        queryClient.getQueryData<Resp<CompleteList>>(
          listKeys.detail(listId)
        )

      queryClient.setQueryData<Resp<CompleteList>>(
        listKeys.detail(listId),
        (old) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              tasks: old.data.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      ...updates,
                      updatedAt: new Date(),
                    }
                  : task
              ),
            },
          }
        }
      )

      return { previousList }
    },

    onError: (_error, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          listKeys.detail(listId),
          context.previousList
        )
      }
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { listId: string; taskId: string }) =>
      tasksService.deleteTask(taskId),

    onMutate: async ({ listId, taskId }) => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(listId)
      })

      const previousList = queryClient.getQueryData<Resp<CompleteList>>(
        listKeys.detail(listId)
      )

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