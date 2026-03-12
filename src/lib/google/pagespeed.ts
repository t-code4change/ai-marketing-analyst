export interface PageSpeedResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  scores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  coreWebVitals: {
    lcp: number | null;   // Largest Contentful Paint (ms)
    fid: number | null;   // First Input Delay (ms)
    cls: number | null;   // Cumulative Layout Shift
    fcp: number | null;   // First Contentful Paint (ms)
    ttfb: number | null;  // Time to First Byte (ms)
    si: number | null;    // Speed Index (ms)
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  fetchedAt: string;
}

export async function fetchPageSpeed(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;

  const params = new URLSearchParams({
    url,
    strategy,
    ...(apiKey ? { key: apiKey } : {}),
    category: ['performance', 'seo', 'accessibility', 'best-practices'] as any,
  });

  // Add multiple category params
  const fullUrl = `${endpoint}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices${apiKey ? `&key=${apiKey}` : ''}`;

  const res = await fetch(fullUrl, { next: { revalidate: 0 } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || body?.error || `HTTP ${res.status}`;
    throw new Error(`PageSpeed API: ${msg}`);
  }

  const data = await res.json();
  const cats = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  const score = (cat: any) => cat ? Math.round((cat.score || 0) * 100) : 0;
  const numericValue = (id: string) => audits[id]?.numericValue ?? null;

  const opportunities = Object.values(audits)
    .filter((a: any) => a.details?.type === 'opportunity' && a.score !== null && a.score < 0.9)
    .slice(0, 5)
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      savings: a.displayValue || '',
    }));

  const diagnostics = Object.values(audits)
    .filter((a: any) => a.details?.type === 'table' && a.score !== null && a.score < 0.9)
    .slice(0, 5)
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
    }));

  return {
    url,
    strategy,
    scores: {
      performance: score(cats['performance']),
      seo: score(cats['seo']),
      accessibility: score(cats['accessibility']),
      bestPractices: score(cats['best-practices']),
    },
    coreWebVitals: {
      lcp: numericValue('largest-contentful-paint'),
      fid: numericValue('max-potential-fid'),
      cls: numericValue('cumulative-layout-shift'),
      fcp: numericValue('first-contentful-paint'),
      ttfb: numericValue('server-response-time'),
      si: numericValue('speed-index'),
    },
    opportunities,
    diagnostics,
    fetchedAt: new Date().toISOString(),
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#4DFFB4'; // mint - good
  if (score >= 50) return '#FF8C00'; // orange - needs improvement
  return '#FF6B6B';                  // coral - poor
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}
