import { claudeCode } from 'ai-sdk-provider-claude-code';
import { generateText } from 'ai';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const CLAUDE_PATH = process.env.CLAUDE_CLI_PATH || 'claude';

export async function callClaudeCLI(
  prompt: string,
  model = 'claude-sonnet-4-6'
): Promise<string> {
  const { text } = await generateText({
    model: claudeCode(model),
    prompt,
  });
  return text;
}

export async function checkClaudeCLIAvailable(): Promise<{
  available: boolean;
  version?: string;
  loggedIn?: boolean;
}> {
  try {
    const { stdout } = await execFileAsync(CLAUDE_PATH, ['--version'], { timeout: 5000 });

    try {
      await execFileAsync(CLAUDE_PATH, ['-p', 'ok'], { timeout: 15000 });
      return { available: true, version: stdout.trim(), loggedIn: true };
    } catch {
      return { available: true, version: stdout.trim(), loggedIn: false };
    }
  } catch {
    return { available: false };
  }
}
