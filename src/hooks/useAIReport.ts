'use client';

import { useEffect, useState, useCallback } from 'react';
import { AIReport } from '@/types';

export function useAIReport(websiteId?: string) {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [latestReport, setLatestReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/report?websiteId=${websiteId}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports || []);
      setLatestReport(data.reports?.[0] || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const generateReport = useCallback(async () => {
    if (!websiteId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setLatestReport(data.report);
      setReports(prev => [data.report, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [websiteId]);

  return { reports, latestReport, loading, generating, error, generateReport, refetch: fetchReports };
}
