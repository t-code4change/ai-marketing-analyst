'use client';

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { queryClient } from '@/lib/query/client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // Only create persister on client side
    const p = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'ama_query_cache',
    });
    setPersister(p);
  }, []);

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24h
        buster: 'v1',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
