'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { Website } from '@/types';
import { queryKeys } from '@/lib/query/keys';

const SELECTED_KEY = 'ama_selected_website';

function readSelectedId(): string {
  try { return localStorage.getItem(SELECTED_KEY) || ''; } catch { return ''; }
}

function writeSelectedId(id: string) {
  try { localStorage.setItem(SELECTED_KEY, id); } catch {}
}

async function fetchWebsites(): Promise<Website[]> {
  const res = await fetch('/api/websites');
  if (!res.ok) throw new Error('Failed to fetch websites');
  const data = await res.json();
  return data.websites || [];
}

export function useWebsite(preferredId?: string) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>('');

  // Hydrate selectedId from localStorage on mount
  useEffect(() => {
    setSelectedId(preferredId || readSelectedId());
  }, [preferredId]);

  const { data: websites = [], isLoading, error } = useQuery({
    queryKey: queryKeys.websites,
    queryFn: fetchWebsites,
    staleTime: 2 * 60 * 1000, // 2 min
  });

  const currentWebsite = websites.find(w => w.id === selectedId) || websites[0] || null;

  const setCurrentWebsite = useCallback((website: Website | null) => {
    const id = website?.id || '';
    setSelectedId(id);
    if (id) writeSelectedId(id);
  }, []);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.websites });
  }, [queryClient]);

  return {
    websites,
    currentWebsite,
    setCurrentWebsite,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
