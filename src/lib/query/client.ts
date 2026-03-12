import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 min — serve cache, refetch in bg after 5min
      gcTime: 24 * 60 * 60 * 1000,     // 24h — keep in memory/localStorage
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
