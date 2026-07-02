import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listsService } from '@/services/lists'
import { AllList, CompleteList, CreateListInput, UpdateListInput } from '@/models/lists'
import { Resp } from '@/models/base'
import { showNotification } from '@mantine/notifications'

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
      console.log('Creating list with input:', input) // Debugging line
      return listsService.createList(input)
    },
    onMutate: async newList => {
      console.log('Optimistically updating lists with new list:', newList)
      await queryClient.cancelQueries({
        queryKey: listKeys.all
      })

      const previousLists = queryClient.getQueryData(listKeys.all)
      queryClient.setQueryData(listKeys.all, (old: Resp<AllList> | undefined) => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            owned: [...old.data.owned, newList]
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
