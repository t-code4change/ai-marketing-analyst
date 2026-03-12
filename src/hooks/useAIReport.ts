'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIReport } from '@/types';
import { queryKeys } from '@/lib/query/keys';

async function fetchReports(websiteId: string): Promise<AIReport[]> {
  const res = await fetch(`/api/ai/report?websiteId=${websiteId}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  const data = await res.json();
  return data.reports || [];
}

async function generateReportFn(params: { websiteId: string; provider?: string; apiKey?: string; model?: string }): Promise<AIReport> {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to generate report');
  const data = await res.json();
  return data.report;
}

export function useAIReport(websiteId?: string) {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.aiReports(websiteId || ''),
    queryFn: () => fetchReports(websiteId!),
    enabled: !!websiteId,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  const mutation = useMutation({
    mutationFn: generateReportFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiReports(websiteId || '') });
    },
  });

  const generateReport = (options?: { provider?: string; apiKey?: string; model?: string }) => {
    if (!websiteId) return;
    mutation.mutate({ websiteId, ...options });
  };

  return {
    reports,
    latestReport: reports[0] || null,
    loading,
    generating: mutation.isPending,
    error: error?.message || mutation.error?.message || null,
    generateReport,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.aiReports(websiteId || '') }),
  };
}
