import { inviteService } from '@/services/invite'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: inviteService.getInvites,
    staleTime: 1000 * 60 * 10
  })
}

export function useRevokeInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) => {
      return inviteService.revokeInvite(inviteId)
    },

    onSuccess: () => {
      // Invalidate the invites query to refetch the updated list of invites
      queryClient.invalidateQueries({ queryKey: ['invites'] })
    }
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string | null) => {
      return inviteService.createInvite(email)
    },

    onSuccess: () => {
      // Invalidate the invites query to refetch the updated list of invites
      queryClient.invalidateQueries({ queryKey: ['invites'] })
    }
  })
}
