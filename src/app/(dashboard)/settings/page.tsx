'use client';

import { useWebsite } from '@/hooks/useWebsite';
import { GoogleConnectFlow } from '@/components/settings/GoogleConnectFlow';
import { Github, Plus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

function GitHubConnectCard({ websiteId }: { websiteId: string }) {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/connect/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, owner, repo }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
      <div className="border-b-[3px] border-black bg-black px-6 py-4 flex items-center gap-3">
        <Github className="w-5 h-5 text-white" strokeWidth={2} />
        <div>
          <h2 className="font-black text-lg text-white uppercase tracking-wide">GITHUB REPO</h2>
          <p className="text-xs font-bold text-white/50">Phân tích SEO issues trong code của bạn</p>
        </div>
      </div>
      <div className="p-6">
        {success ? (
          <div className="border-[2px] border-black bg-[#4DFFB4] px-4 py-3">
            <p className="font-black text-sm">✓ GitHub repo connected! Đang phân tích code...</p>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            {error && (
              <div className="border-[2px] border-black bg-[#FF6B6B] px-4 py-2">
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black mb-1 uppercase tracking-wider">GitHub Owner</label>
                <input
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                  placeholder="username or org"
                  required
                  className="w-full border-[2px] border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-black mb-1 uppercase tracking-wider">Repo Name</label>
                <input
                  value={repo}
                  onChange={e => setRepo(e.target.value)}
                  placeholder="repository-name"
                  required
                  className="w-full border-[2px] border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-shadow"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full border-[2px] border-black bg-white py-2.5 font-black text-sm shadow-[2px_2px_0px_#000] hover:bg-[#FFE500] hover:shadow-[3px_3px_0px_#000] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" strokeWidth={2.5} />
              {loading ? 'CONNECTING...' : 'CONNECT REPO →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentWebsite } = useWebsite();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-black text-2xl tracking-tight">SETTINGS</h1>
        <p className="text-sm font-bold text-black/50 uppercase tracking-wider">CONNECT YOUR DATA SOURCES</p>
      </div>

      {!currentWebsite ? (
        <div className="border-[3px] border-black bg-[#FFE500] shadow-[4px_4px_0px_#000] p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" strokeWidth={3} />
            <p className="font-black">Chọn hoặc thêm website trước ở trang Websites.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="border-[2px] border-black bg-[#FFFEF0] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-black/40 uppercase tracking-widest">WEBSITE ĐANG CHỌN</p>
              <p className="font-black text-lg">{currentWebsite.domain}</p>
            </div>
            <a
              href="/settings/websites"
              className="border-[2px] border-black px-3 py-1.5 text-xs font-black bg-white shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3" strokeWidth={3} /> ĐỔI
            </a>
          </div>

          <GoogleConnectFlow websiteId={currentWebsite.id!} />
          <GitHubConnectCard websiteId={currentWebsite.id!} />
        </>
      )}
    </div>
  );
}
