import { callAIProvider, AIProviderConfig } from './providers';
import { buildAnalysisPrompt } from './prompts';
import { AIReport } from '@/types';
import { adminDb } from '@/lib/firebase/admin';

interface AnalysisInput {
  websiteId: string;
  website: { domain: string; repo?: string };
  analytics?: any;
  ads?: any;
  searchConsole?: any;
  github?: any;
  providerConfig?: AIProviderConfig;
}

function getDefaultProviderConfig(): AIProviderConfig {
  // Default: try Claude CLI first, fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      type: 'openai',
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: 'gpt-4o',
    };
  }
  return {
    type: 'claude-cli',
    claudeModel: 'claude-sonnet-4-6',
  };
}

export async function runAIAnalysis(input: AnalysisInput): Promise<AIReport> {
  const providerConfig = input.providerConfig || getDefaultProviderConfig();
  const prompt = buildAnalysisPrompt(input);
  
  let rawContent: string;
  
  try {
    rawContent = await callAIProvider(prompt, providerConfig);
  } catch (error: any) {
    // If Claude CLI fails, try OpenAI as fallback (if configured)
    if (providerConfig.type === 'claude-cli' && process.env.OPENAI_API_KEY) {
      console.warn('Claude CLI failed, falling back to OpenAI:', error.message);
      rawContent = await callAIProvider(prompt, {
        type: 'openai',
        openaiApiKey: process.env.OPENAI_API_KEY,
        openaiModel: 'gpt-4o',
      });
    } else {
      throw error;
    }
  }
  
  // Extract JSON from response (Claude CLI may wrap in markdown)
  let parsed: any;
  try {
    // Try direct parse first
    parsed = JSON.parse(rawContent);
  } catch {
    // Extract JSON from markdown code blocks
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                      rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      throw new Error('Could not parse AI response as JSON');
    }
  }
  
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

  const docRef = await adminDb.collection('ai_reports').add({
    ...report,
    providerUsed: providerConfig.type,
  });
  report.id = docRef.id;

  return report;
}
