'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query/keys';

async function fetchPageSpeed(websiteId: string, forceRefresh = false) {
  const url = `/api/data/pagespeed?websiteId=${websiteId}${forceRefresh ? '&refresh=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch PageSpeed data');
  return res.json();
}

export function usePageSpeed(websiteId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: queryKeys.pagespeed(websiteId || ''),
    queryFn: () => fetchPageSpeed(websiteId!),
    enabled: !!websiteId,
    staleTime: 24 * 60 * 60 * 1000, // 24h — matches Firestore cache TTL
  });

  const refresh = useCallback(async () => {
    if (!websiteId) return;
    await queryClient.fetchQuery({
      queryKey: queryKeys.pagespeed(websiteId),
      queryFn: () => fetchPageSpeed(websiteId, true),
      staleTime: 0,
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.pagespeed(websiteId) });
  }, [websiteId, queryClient]);

  return {
    mobile: data?.mobile || null,
    desktop: data?.desktop || null,
    domain: data?.domain || null,
    fromCache: data?.fromCache,
    syncedAt: data?.syncedAt,
    loading: isLoading,
    fetching: isFetching,
    error: data?.error || error?.message || null,
    refresh,
  };
}
