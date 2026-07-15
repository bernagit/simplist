import { UserPreferences } from '@/models/user'
import { preferencesService } from '@/services/preferences'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function usePreferences(enabled: boolean) {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: preferencesService.getPreferences,
    staleTime: 1000 * 60 * 10,
    enabled: enabled
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      return preferencesService.updatePreferences(data)
    },
    onSuccess: data => {
      // Update the cached preferences data after a successful mutation
      queryClient.setQueryData(['preferences'], data)
    }
  })
}
