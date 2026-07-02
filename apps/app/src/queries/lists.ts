import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listsService } from '@/services/lists';
import { CompleteList, UpdateListInput } from '@/models/lists';
import { Resp } from '@/models/base';
import { showNotification } from '@mantine/notifications';

export const listKeys = {
  all: ['lists'] as const,
  detail: (id: string) => [...listKeys.all, id] as const,
};

export function useLists() {
  return useQuery({
    queryKey: listKeys.all,
    queryFn: listsService.getLists,
    staleTime: 5 * 60 * 1000,
  });
}

export function useListById(id: string) {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => listsService.getListById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateListInput) =>
      listsService.updateList(input),

    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({
        queryKey: listKeys.detail(id),
      });

      const previousList = queryClient.getQueryData(listKeys.detail(id));

      queryClient.setQueryData(listKeys.detail(id), (old: Resp<CompleteList>) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            title,
          },
        };
      });

      return { previousList };
    },

    onError: (_error, variables, context) => {
      showNotification({
        title: 'Error',
        message: 'Failed to update list title. Please try again.',
        color: 'red',
      });
      if (context?.previousList) {
        queryClient.setQueryData(
          listKeys.detail(variables.id),
          context.previousList
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: listKeys.detail(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: listKeys.all,
      });
    },
  });
}