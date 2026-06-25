import { authService } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    staleTime: 1000 * 60 * 10,

    select: (response) => ({
      ...response.data,
      initials:
        response.data.name?.charAt(0)?.toUpperCase() ??
        response.data.email?.charAt(0)?.toUpperCase() ??
        "",
    }),
  });
}