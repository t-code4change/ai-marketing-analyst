import OpenAI from 'openai';

let cachedClients: Map<string, OpenAI> = new Map();

function getOpenAIClient(apiKey: string): OpenAI {
  if (!cachedClients.has(apiKey)) {
    cachedClients.set(apiKey, new OpenAI({ apiKey }));
  }
  return cachedClients.get(apiKey)!;
}

export async function callOpenAI(
  prompt: string,
  systemPrompt: string,
  apiKey: string,
  model = 'gpt-4o'
): Promise<string> {
  const client = getOpenAIClient(apiKey);
  
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });
  
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from OpenAI');
  return content;
}

export async function checkOpenAIAvailable(apiKey: string): Promise<{ available: boolean; error?: string }> {
  try {
    const client = getOpenAIClient(apiKey);
    await client.models.list();
    return { available: true };
  } catch (error: any) {
    return { available: false, error: error.message };
  }
}
