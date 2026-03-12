import { getOpenAIClient } from './openai';
import { buildAnalysisPrompt, ANALYSIS_SYSTEM_PROMPT } from './prompts';
import { AIReport } from '@/types';
import { adminDb } from '@/lib/firebase/admin';

interface AnalysisInput {
  websiteId: string;
  website: { domain: string; repo?: string };
  analytics?: any;
  ads?: any;
  searchConsole?: any;
  github?: any;
}

export async function runAIAnalysis(input: AnalysisInput): Promise<AIReport> {
  const client = getOpenAIClient();
  
  const prompt = buildAnalysisPrompt(input);
  
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from OpenAI');

  const parsed = JSON.parse(content);
  
  const report: AIReport = {
    websiteId: input.websiteId,
    createdAt: new Date().toISOString(),
    period: 'monthly',
    summary: parsed.summary || '',
    issues: parsed.issues || [],
    opportunities: parsed.opportunities || [],
    keywords: parsed.keywords || [],
    strategies: parsed.strategies || [],
    score: parsed.score || { overall: 0, seo: 0, ads: 0, technical: 0, content: 0 },
  };

  // Save to Firestore
  const docRef = await adminDb.collection('ai_reports').add(report);
  report.id = docRef.id;

  return report;
}
