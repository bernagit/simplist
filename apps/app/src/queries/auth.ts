import { authService } from '@/services/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    staleTime: 1000 * 60 * 10,

    select: response => ({
      ...response.data,
      initials:
        response.data.name?.charAt(0)?.toUpperCase() ??
        response.data.email?.charAt(0)?.toUpperCase() ??
        ''
    })
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name?: string; email?: string, avatar?: string | null }) => {
      return authService.updateCurrentUser(data)
    },
    onSuccess: updatedUser => {
      queryClient.setQueryData(['me'], updatedUser)
    }
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => {
      return authService.changePassword(data.currentPassword, data.newPassword)
    }
  })
}
