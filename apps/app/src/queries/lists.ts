import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listsService } from '@/services/lists'
import { AllList, CompleteList, CreateListInput, UpdateListInput } from '@/models/lists'
import { ErrorResponse, Resp } from '@/models/base'
import { showNotification } from '@mantine/notifications'
import { HTTPError } from 'ky'

export const listKeys = {
  all: ['lists'] as const,
  detail: (id: string) => [...listKeys.all, id] as const
}

export function useLists() {
  return useQuery({
    queryKey: listKeys.all,
    queryFn: listsService.getLists,
    staleTime: 5 * 60 * 1000
  })
}

export function useListById(id: string) {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => listsService.getListById(id),
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateListInput) => {
      return listsService.createList(input)
    },
    onMutate: async newList => {
      await queryClient.cancelQueries({
        queryKey: listKeys.all
      })

      const previousLists = queryClient.getQueryData(listKeys.all)

      const optimisticList = {
        ...newList,
        id: `temp-id-${Math.random()}`
      }
      queryClient.setQueryData(listKeys.all, (old: Resp<AllList> | undefined) => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            owned: [...old.data.owned, optimisticList]
          }
        }
      })

      return { previousLists }
    },
    onError: (_error, _variables, context) => {
      showNotification({
        title: 'Error',
        message: 'Failed to create list. Please try again.',
        color: 'red'
      })
      if (context?.previousLists) {
        queryClient.setQueryData(listKeys.all, context.previousLists)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: listKeys.all
      })
    }
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateListInput) => listsService.updateList(input),

    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(id)
      })

      const previousList = queryClient.getQueryData(listKeys.detail(id))

      queryClient.setQueryData(listKeys.detail(id), (old: Resp<CompleteList>) => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            title
          }
        }
      })

      return { previousList }
    },

    onError: (_error, variables, context) => {
      showNotification({
        title: 'Error',
        message: 'Failed to update list title. Please try again.',
        color: 'red'
      })
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(variables.id), context.previousList)
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(variables.id)
      })

      queryClient.invalidateQueries({
        queryKey: listKeys.all
      })
    }
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listId: string) => listsService.deleteList(listId),
    onError: async error => {
      let message = 'Something went wrong. Please try again.'

      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<ErrorResponse>()
          message = body.message
        } catch {
          // Ignore JSON parsing errors
        }
      }

      showNotification({
        title: 'Unable to delete list',
        message,
        color: 'red'
      })
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_data, listId) => {
      queryClient.invalidateQueries({
        queryKey: listKeys.all
      })
      showNotification({
        title: 'Success',
        message: `List deleted successfully.`,
        color: 'green'
      })
    }
  })
}

export function useShareList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      listId,
      shareWithEmail,
      role
    }: {
      listId: string
      shareWithEmail: string
      role: 'editor' | 'viewer'
    }) => listsService.shareList(listId, { shareWithEmail, role }),

    onError: async error => {
      let message = 'Something went wrong. Please try again.'

      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<ErrorResponse>()
          message = body.message
        } catch {
          // Ignore JSON parsing errors
        }
      }

      showNotification({
        title: 'Unable to share list',
        message,
        color: 'red'
      })
    },

    onSuccess: (_data, variables) => {
      // reload the list details to get the updated members
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(variables.listId)
      })
      queryClient.invalidateQueries({
        queryKey: listKeys.all
      })
      showNotification({
        title: 'Success',
        message: `List shared with ${variables.shareWithEmail} as ${variables.role}.`,
        color: 'green'
      })
    }
  })
}

export const useDeleteListMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listId, memberId }: { listId: string; memberId: string }) =>
      listsService.deleteListMember(listId, memberId),

    onError: async error => {
      let message = 'Something went wrong. Please try again.'

      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<ErrorResponse>()
          message = body.message
        } catch {
          // Ignore JSON parsing errors
        }
      }

      showNotification({
        title: 'Unable to remove member',
        message,
        color: 'red'
      })
    },

    onSuccess: (_data, variables) => {
      // reload the list details to get the updated members
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(variables.listId)
      })
      showNotification({
        title: 'Success',
        message: `Member removed from the list.`,
        color: 'green'
      })
    }
  })
}

export const useChangeListMemberRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      listId,
      memberId,
      role
    }: {
      listId: string
      memberId: string
      role: 'editor' | 'viewer'
    }) => listsService.changeListMemberRole(listId, memberId, role),

    onError: async error => {
      let message = 'Something went wrong. Please try again.'

      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<ErrorResponse>()
          message = body.message
        } catch {
          // Ignore JSON parsing errors
        }
      }

      showNotification({
        title: 'Unable to change member role',
        message,
        color: 'red'
      })
    },

    onSuccess: (_data, variables) => {
      // reload the list details to get the updated members
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(variables.listId)
      })
      showNotification({
        title: 'Success',
        message: `Member role changed to ${variables.role}.`,
        color: 'green'
      })
    }
  })
}

export const useArchiveList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listId: string) => listsService.archiveList(listId),

    onError: async error => {
      let message = 'Something went wrong. Please try again.'

      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<ErrorResponse>()
          message = body.message
        } catch {
          // Ignore JSON parsing errors
        }
      }

      showNotification({
        title: 'Unable to archive list',
        message,
        color: 'red'
      })
    },

    onSuccess: (_data, listId) => {
      // reload the list details to get the updated members
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(listId)
      })
      queryClient.invalidateQueries({
        queryKey: listKeys.all
      })
      showNotification({
        title: 'Success',
        message: `List archived successfully.`,
        color: 'green'
      })
    }
  })
}

export const useUnarchiveList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listId: string) => listsService.unarchiveList(listId),

    onError: async error => {
      let message = 'Something went wrong. Please try again.'

      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json<ErrorResponse>()
          message = body.message
        } catch {
          // Ignore JSON parsing errors
        }
      }

      showNotification({
        title: 'Unable to unarchive list',
        message,
        color: 'red'
      })
    },

    onSuccess: (_data, listId) => {
      // reload the list details to get the updated members
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(listId)
      })
      queryClient.invalidateQueries({
        queryKey: listKeys.all
      })
      showNotification({
        title: 'Success',
        message: `List unarchived successfully.`,
        color: 'green'
      })
    }
  })
}
