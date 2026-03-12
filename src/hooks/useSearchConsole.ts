'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query/keys';

async function fetchSearchConsole(websiteId: string, forceRefresh = false) {
  const url = `/api/data/search-console?websiteId=${websiteId}${forceRefresh ? '&refresh=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch search console data');
  return res.json();
}

export function useSearchConsole(websiteId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: queryKeys.searchConsole(websiteId || ''),
    queryFn: () => fetchSearchConsole(websiteId!),
    enabled: !!websiteId,
    staleTime: 6 * 60 * 60 * 1000, // 6h
  });

  const refresh = useCallback(async () => {
    if (!websiteId) return;
    await queryClient.fetchQuery({
      queryKey: queryKeys.searchConsole(websiteId),
      queryFn: () => fetchSearchConsole(websiteId, true),
      staleTime: 0,
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.searchConsole(websiteId) });
  }, [websiteId, queryClient]);

  return {
    queries: data?.queries || [],
    pages: data?.pages || [],
    summary: data?.summary || null,
    insights: data?.insights || null,
    fromCache: data?.fromCache,
    syncedAt: data?.syncedAt,
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    refresh,
  };
}
