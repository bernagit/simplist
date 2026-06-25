import { listsService } from "@/services/lists";
import { useQuery } from "@tanstack/react-query";

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: listsService.getLists,
    staleTime: 1000 * 60 * 5,
  });
}