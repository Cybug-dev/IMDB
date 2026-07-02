import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 20,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 2000),
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});
