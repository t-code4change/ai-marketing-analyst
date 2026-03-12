'use client';

import { useState } from 'react';
import { Bell, RefreshCw, LogOut, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWebsite } from '@/hooks/useWebsite';

export function DashboardHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const { websites, currentWebsite, setCurrentWebsite } = useWebsite();
  const [syncing, setSyncing] = useState(false);
  const [showSiteMenu, setShowSiteMenu] = useState(false);

  async function handleSync() {
    if (!currentWebsite?.id) return;
    setSyncing(true);
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: currentWebsite.id }),
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <header className="border-b-[3px] border-black bg-white px-6 py-3 flex items-center justify-between shrink-0">
      {/* Website selector */}
      <div className="relative">
        <button
          onClick={() => setShowSiteMenu(!showSiteMenu)}
          className="flex items-center gap-2 border-[2px] border-black px-3 py-1.5 text-sm font-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all bg-white"
        >
          <div className="w-2 h-2 bg-[#4DFFB4] border-[1px] border-black" />
          {currentWebsite?.domain || 'Select website'}
          <ChevronDown className="w-3 h-3" strokeWidth={3} />
        </button>
        {showSiteMenu && websites.length > 0 && (
          <div className="absolute top-full left-0 mt-1 bg-white border-[2px] border-black shadow-[4px_4px_0px_#000] min-w-[200px] z-50">
            {websites.map(site => (
              <button
                key={site.id}
                onClick={() => { setCurrentWebsite(site); setShowSiteMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-[#FFE500] border-b-[1px] border-black/20 last:border-0 transition-colors"
              >
                {site.domain}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 border-[2px] border-black px-3 py-1.5 text-xs font-black bg-[#4DFFB4] shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} strokeWidth={3} />
          {syncing ? 'SYNCING...' : 'SYNC'}
        </button>

        <button className="border-[2px] border-black p-1.5 bg-white shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] transition-all">
          <Bell className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2 border-l-[2px] border-black pl-3 ml-1">
          <div className="w-7 h-7 border-[2px] border-black bg-[#FFE500] flex items-center justify-center text-xs font-black">
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-black text-black/50 hover:text-black transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
