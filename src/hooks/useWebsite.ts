'use client';

import { useEffect, useState, useCallback } from 'react';
import { Website } from '@/types';

const CACHE_KEY = 'ama_websites';
const SELECTED_KEY = 'ama_selected_website';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function readCache(): Website[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(websites: Website[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: websites, ts: Date.now() }));
  } catch {}
}

function readSelectedId(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

function writeSelectedId(id: string) {
  try {
    localStorage.setItem(SELECTED_KEY, id);
  } catch {}
}

function pickWebsite(websites: Website[], preferredId?: string): Website | null {
  if (!websites.length) return null;
  const savedId = preferredId ?? readSelectedId() ?? '';
  return websites.find(w => w.id === savedId) || websites[0];
}

export function useWebsite(websiteId?: string) {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsiteState] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from cache immediately on mount
  useEffect(() => {
    const cached = readCache();
    if (cached?.length) {
      setWebsites(cached);
      setCurrentWebsiteState(pickWebsite(cached, websiteId));
      setLoading(false);
    }
  }, []);

  const fetchWebsites = useCallback(async () => {
    try {
      const res = await fetch('/api/websites');
      if (!res.ok) throw new Error('Failed to fetch websites');
      const data = await res.json();
      const list: Website[] = data.websites || [];
      writeCache(list);
      setWebsites(list);
      setCurrentWebsiteState(prev => {
        const next = pickWebsite(list, websiteId || prev?.id);
        if (next?.id) writeSelectedId(next.id);
        return next;
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const setCurrentWebsite = useCallback((website: Website | null) => {
    setCurrentWebsiteState(website);
    if (website?.id) writeSelectedId(website.id);
  }, []);

  return { websites, currentWebsite, setCurrentWebsite, loading, error, refetch: fetchWebsites };
}
