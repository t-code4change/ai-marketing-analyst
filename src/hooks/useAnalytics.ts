'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query/keys';

async function fetchAnalytics(websiteId: string, forceRefresh = false) {
  const url = `/api/data/analytics?websiteId=${websiteId}${forceRefresh ? '&refresh=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export function useAnalytics(websiteId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: queryKeys.analytics(websiteId || ''),
    queryFn: () => fetchAnalytics(websiteId!),
    enabled: !!websiteId,
    staleTime: 6 * 60 * 60 * 1000, // 6h — matches Firestore cache TTL
  });

  const refresh = useCallback(async () => {
    if (!websiteId) return;
    await queryClient.fetchQuery({
      queryKey: queryKeys.analytics(websiteId),
      queryFn: () => fetchAnalytics(websiteId, true),
      staleTime: 0,
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics(websiteId) });
  }, [websiteId, queryClient]);

  return {
    data: data?.data || [],
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
