import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { CreateSectionInput } from '@/models/section'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listKeys } from './lists'
import { sectionService } from '@/services/section'

export function useCreateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSectionInput) => sectionService.createSection(input),

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
            sections: [
              ...old.data.sections,
              {
                id: 'temp-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                order: input.order,
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
            sections: [
              ...old.data.sections.filter(section => section.id !== 'temp-id'),
              response.data
            ]
          }
        }
      })
    },

    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKeys.detail(variables.listId), context.previousList)
      }
    }
  })
}

export function useUpdateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      listId: string
      sectionId: string
      title: string
      order: number | undefined
    }) => sectionService.updateSection(input.sectionId, { title: input.title, order: input.order }),

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
            sections: old.data.sections.map(section =>
              section.id === input.sectionId ? { ...section, title: input.title } : section
            )
          }
        }
      })

      return { previousList }
    },

    onError: (err, variables, context) => {
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
