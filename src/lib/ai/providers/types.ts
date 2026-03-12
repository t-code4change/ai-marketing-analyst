export type AIProviderType = 'claude-cli' | 'openai';

export interface AIProviderConfig {
  type: AIProviderType;
  openaiApiKey?: string;
  openaiModel?: string;
  claudeModel?: string;
}

export interface AIProviderResponse {
  content: string;
  provider: AIProviderType;
  model: string;
}
