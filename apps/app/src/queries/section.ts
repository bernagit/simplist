import { Resp } from '@/models/base'
import { CompleteList } from '@/models/lists'
import { CreateSectionInput } from '@/models/section'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listKeys } from './lists'
import { sectionService } from '@/services/section'
import { createTempId } from '@/utils/common'
import { LexoRank } from 'lexorank'

export function useCreateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSectionInput) => sectionService.createSection(input),

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
            sections: [
              ...old.data.sections,
              {
                id: tempId,
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
            sections: [
              ...old.data.sections.filter(section => section.id !== context?.tempId),
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
    }) => sectionService.updateSection(input.sectionId, { title: input.title }),

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

export function useDeleteSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { listId: string; sectionId: string }) =>
      sectionService.deleteSection(input.sectionId),

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
            sections: old.data.sections.filter(section => section.id !== input.sectionId)
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

export function useReorderSections() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      listId: string
      sectionId: string
      prevSectionId: string | undefined
      nextSectionId: string | undefined
    }) =>
      sectionService.reorderSections(
        input.listId,
        input.sectionId,
        input.prevSectionId,
        input.nextSectionId
      ),

    onMutate: async input => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(input.listId)
      })

      const previousList = queryClient.getQueryData<Resp<CompleteList>>(
        listKeys.detail(input.listId)
      )

      queryClient.setQueryData<Resp<CompleteList>>(listKeys.detail(input.listId), old => {
        if (!old) return old

        const prevSection = old.data.sections.find(s => s.id === input.prevSectionId)
        const nextSection = old.data.sections.find(s => s.id === input.nextSectionId)

        const prevRank = prevSection?.order ? LexoRank.parse(prevSection.order) : null
        const nextRank = nextSection?.order ? LexoRank.parse(nextSection.order) : null

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

        const updatedSections = old.data.sections.map(section =>
          section.id === input.sectionId ? { ...section, order: newOrderStr } : section
        )

        return {
          ...old,
          data: {
            ...old.data,
            sections: updatedSections
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