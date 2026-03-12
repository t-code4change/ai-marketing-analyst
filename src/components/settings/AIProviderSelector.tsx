'use client';

import { useEffect, useState } from 'react';
import { Zap, Bot, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ProviderType = 'claude-cli' | 'openai';

interface ProviderStatus {
  available: boolean;
  loggedIn?: boolean;
  version?: string;
  configured?: boolean;
  requiresKey: boolean;
  label: string;
  description: string;
  error?: string;
}

interface AIProviderSelectorProps {
  value: ProviderType;
  onChange: (provider: ProviderType, config?: { apiKey?: string; model?: string }) => void;
  disabled?: boolean;
}

const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Recommended)' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6 (Most capable)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Fastest)' },
];

const OPENAI_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (Recommended)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster)' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
];

export function AIProviderSelector({ value, onChange, disabled }: AIProviderSelectorProps) {
  const [statuses, setStatuses] = useState<Record<ProviderType, ProviderStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [claudeModel, setClaudeModel] = useState('claude-sonnet-4-6');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');

  useEffect(() => {
    fetch('/api/ai/provider-status')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.providers) setStatuses(data.providers);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(type: ProviderType) {
    if (type === 'claude-cli') {
      onChange(type, { model: claudeModel });
    } else {
      onChange(type, { apiKey: openaiKey, model: openaiModel });
    }
  }

  if (loading) {
    return (
      <div className="border-[2px] border-black bg-white p-6 shadow-[3px_3px_0px_#000]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
          <span className="font-bold text-sm">Checking AI providers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Claude Code CLI */}
      <div
        className={cn(
          'border-[3px] border-black bg-white transition-all cursor-pointer',
          value === 'claude-cli'
            ? 'shadow-[5px_5px_0px_#000] translate-x-[-2px] translate-y-[-2px]'
            : 'shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !disabled && handleSelect('claude-cli')}
      >
        {/* Header */}
        <div className={cn(
          'border-b-[2px] border-black px-4 py-3 flex items-center justify-between',
          value === 'claude-cli' ? 'bg-[#FFE500]' : 'bg-white'
        )}>
          <div className="flex items-center gap-3">
            {/* Selection indicator */}
            <div className={cn(
              'w-4 h-4 border-[2px] border-black flex items-center justify-center',
              value === 'claude-cli' ? 'bg-black' : 'bg-white'
            )}>
              {value === 'claude-cli' && <div className="w-2 h-2 bg-[#FFE500]" />}
            </div>
            <Zap className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-black text-sm uppercase tracking-wider">Claude Code CLI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="border-[1.5px] border-black px-2 py-0.5 text-[10px] font-black bg-[#4DFFB4]">
              NO API KEY
            </span>
            {statuses?.['claude-cli']?.available && statuses?.['claude-cli']?.loggedIn ? (
              <CheckCircle2 className="w-4 h-4 text-green-700" strokeWidth={2.5} />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" strokeWidth={2.5} />
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs font-medium text-black/60">
            Dùng subscription Claude Code đang đăng nhập. Không cần API key riêng.
          </p>

          {statuses?.['claude-cli'] && (
            <div className={cn(
              'border-[1.5px] border-black px-3 py-2 text-xs font-bold',
              statuses['claude-cli'].available && statuses['claude-cli'].loggedIn
                ? 'bg-[#4DFFB4]/30'
                : statuses['claude-cli'].available
                ? 'bg-[#FFE500]/50'
                : 'bg-[#FF6B6B]/30'
            )}>
              {statuses['claude-cli'].available && statuses['claude-cli'].loggedIn
                ? `✓ Claude CLI ready ${statuses['claude-cli'].version ? `(${statuses['claude-cli'].version})` : ''}`
                : statuses['claude-cli'].available
                ? '⚠ CLI found but not logged in — run: claude login'
                : '✗ Claude CLI not found — install from claude.ai/download'}
            </div>
          )}

          {value === 'claude-cli' && (
            <div onClick={e => e.stopPropagation()}>
              <label className="block text-xs font-black mb-1 uppercase tracking-wider">Model</label>
              <select
                value={claudeModel}
                onChange={e => { setClaudeModel(e.target.value); onChange('claude-cli', { model: e.target.value }); }}
                className="w-full border-[2px] border-black px-3 py-2 text-xs font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0px_#000] appearance-none"
              >
                {CLAUDE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* OpenAI / ChatGPT */}
      <div
        className={cn(
          'border-[3px] border-black bg-white transition-all cursor-pointer',
          value === 'openai'
            ? 'shadow-[5px_5px_0px_#000] translate-x-[-2px] translate-y-[-2px]'
            : 'shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !disabled && handleSelect('openai')}
      >
        <div className={cn(
          'border-b-[2px] border-black px-4 py-3 flex items-center justify-between',
          value === 'openai' ? 'bg-[#4D79FF] text-white' : 'bg-white'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-4 h-4 border-[2px] flex items-center justify-center',
              value === 'openai' ? 'border-white bg-white' : 'border-black bg-white'
            )}>
              {value === 'openai' && <div className="w-2 h-2 bg-[#4D79FF]" />}
            </div>
            <Bot className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-black text-sm uppercase tracking-wider">ChatGPT / OpenAI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'border-[1.5px] px-2 py-0.5 text-[10px] font-black',
              value === 'openai' ? 'border-white bg-white text-black' : 'border-black bg-white'
            )}>
              API KEY
            </span>
            {statuses?.openai?.available ? (
              <CheckCircle2 className={cn('w-4 h-4', value === 'openai' ? 'text-[#4DFFB4]' : 'text-green-700')} strokeWidth={2.5} />
            ) : (
              <XCircle className={cn('w-4 h-4', value === 'openai' ? 'text-[#FF6B6B]' : 'text-red-600')} strokeWidth={2.5} />
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs font-medium text-black/60">
            GPT-4o qua OpenAI API. Cần API key từ platform.openai.com.
          </p>

          {!statuses?.openai?.configured && (
            <div className="border-[1.5px] border-black bg-[#FFE500]/30 px-3 py-2 text-xs font-bold">
              ⚠ Chưa có OPENAI_API_KEY trong .env.local — nhập key bên dưới để dùng tạm
            </div>
          )}

          {value === 'openai' && (
            <div className="space-y-3" onClick={e => e.stopPropagation()}>
              {!statuses?.openai?.configured && (
                <div>
                  <label className="block text-xs font-black mb-1 uppercase tracking-wider">API Key (session only)</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={e => { setOpenaiKey(e.target.value); onChange('openai', { apiKey: e.target.value, model: openaiModel }); }}
                      placeholder="sk-..."
                      className="w-full border-[2px] border-black px-3 py-2 pr-10 text-xs font-medium bg-white focus:outline-none focus:shadow-[2px_2px_0px_#000]"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-black mb-1 uppercase tracking-wider">Model</label>
                <select
                  value={openaiModel}
                  onChange={e => { setOpenaiModel(e.target.value); onChange('openai', { apiKey: openaiKey, model: e.target.value }); }}
                  className="w-full border-[2px] border-black px-3 py-2 text-xs font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0px_#000] appearance-none"
                >
                  {OPENAI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
