import { AIProviderConfig, AIProviderType } from './types';
import { callClaudeCLI } from './claude-cli';
import { callOpenAI } from './openai-provider';
import { ANALYSIS_SYSTEM_PROMPT } from '../prompts';

export { checkClaudeCLIAvailable } from './claude-cli';
export { checkOpenAIAvailable } from './openai-provider';
export type { AIProviderConfig, AIProviderType } from './types';

export async function callAIProvider(
  prompt: string,
  config: AIProviderConfig
): Promise<string> {
  switch (config.type) {
    case 'claude-cli': {
      // For Claude CLI, embed the system prompt into the user prompt
      // since --print mode doesn't support separate system messages easily
      const fullPrompt = `${ANALYSIS_SYSTEM_PROMPT}\n\n---\n\n${prompt}\n\nIMPORTANT: Respond with valid JSON only, no markdown, no explanation outside the JSON.`;
      return callClaudeCLI(fullPrompt, config.claudeModel || 'claude-sonnet-4-6');
    }
    
    case 'openai': {
      if (!config.openaiApiKey) {
        throw new Error('OpenAI API key is required');
      }
      return callOpenAI(
        prompt,
        ANALYSIS_SYSTEM_PROMPT,
        config.openaiApiKey,
        config.openaiModel || 'gpt-4o'
      );
    }
    
    default:
      throw new Error(`Unknown AI provider: ${config.type}`);
  }
}
