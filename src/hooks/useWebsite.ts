'use client';

import { useEffect, useState } from 'react';
import { Website } from '@/types';

export function useWebsite(websiteId?: string) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const res = await fetch('/api/websites');
        if (!res.ok) throw new Error('Failed to fetch websites');
        const data = await res.json();
        setWebsites(data.websites || []);
        if (data.websites?.length > 0) {
          setCurrentWebsite(websiteId 
            ? data.websites.find((w: Website) => w.id === websiteId) || data.websites[0]
            : data.websites[0]
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWebsites();
  }, [websiteId]);

  return { websites, currentWebsite, setCurrentWebsite, loading, error };
}
