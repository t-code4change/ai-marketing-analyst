import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function callClaudeCLI(
  prompt: string,
  model = 'claude-sonnet-4-6'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'claude',
      ['-p', '--model', model, '--output-format', 'text'],
      {
        env: { ...process.env },
        timeout: 180000,
      }
    );

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code: number | null) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Claude CLI exited with code ${code}. ${stderr.trim()}`));
      }
    });

    proc.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        reject(new Error('Claude Code CLI not found. Make sure `claude` is installed and in PATH.'));
      } else {
        reject(new Error(`Claude CLI spawn error: ${error.message}`));
      }
    });

    // Send prompt via stdin
    proc.stdin.write(prompt, 'utf-8');
    proc.stdin.end();
  });
}

export async function checkClaudeCLIAvailable(): Promise<{
  available: boolean;
  version?: string;
  loggedIn?: boolean;
}> {
  try {
    const { stdout } = await execFileAsync('claude', ['--version'], { timeout: 5000 });

    // Quick login check
    try {
      await execFileAsync('claude', ['-p', 'ok'], { timeout: 15000 });
      return { available: true, version: stdout.trim(), loggedIn: true };
    } catch {
      return { available: true, version: stdout.trim(), loggedIn: false };
    }
  } catch {
    return { available: false };
  }
}
