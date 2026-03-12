'use client';

import { useState } from 'react';
import { useWebsite } from '@/hooks/useWebsite';
import { Globe, Plus, Trash2, Github } from 'lucide-react';
import { Website } from '@/types';

export default function WebsitesPage() {
  const { websites, loading, currentWebsite, setCurrentWebsite } = useWebsite();
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  async function handleAddWebsite(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, name }),
      });
      if (!res.ok) throw new Error('Failed to add website');
      const data = await res.json();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl tracking-tight">WEBSITES</h1>
        <p className="text-sm font-bold text-black/50 uppercase tracking-wider">MANAGE YOUR TRACKED WEBSITES</p>
      </div>

      {/* Add website */}
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
        <div className="border-b-[3px] border-black bg-[#FFE500] px-5 py-3">
          <h2 className="font-black uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={3} /> ADD WEBSITE
          </h2>
        </div>
        <form onSubmit={handleAddWebsite} className="p-5 space-y-4">
          {error && (
            <div className="border-[2px] border-black bg-[#FF6B6B] px-4 py-2">
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black mb-1 uppercase tracking-wider">Domain *</label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                required
                placeholder="example.com"
                className="w-full border-[2px] border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_#000] transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-black mb-1 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My Website"
                className="w-full border-[2px] border-black px-3 py-2.5 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_#000] transition-shadow"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="border-[2px] border-black bg-black text-[#FFE500] px-6 py-2.5 font-black text-sm shadow-[2px_2px_0px_#FFE500] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#FFE500] transition-all disabled:opacity-50"
          >
            {adding ? 'ADDING...' : 'ADD WEBSITE →'}
          </button>
        </form>
      </div>

      {/* Websites list */}
      <div className="space-y-3">
        <h2 className="font-black text-xs uppercase tracking-widest">YOUR WEBSITES ({websites.length})</h2>
        {loading ? (
          <div className="border-[2px] border-black bg-white p-8 text-center">
            <div className="animate-pulse font-black text-sm">LOADING...</div>
          </div>
        ) : websites.length === 0 ? (
          <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-8 text-center">
            <Globe className="w-8 h-8 mx-auto mb-3 text-black/30" strokeWidth={1.5} />
            <p className="font-black text-sm">NO WEBSITES YET</p>
            <p className="text-sm font-medium text-black/60 mt-1">Add your first website above.</p>
          </div>
        ) : (
          websites.map((site: Website) => (
            <div
              key={site.id}
              className={`border-[2px] border-black bg-white shadow-[3px_3px_0px_#000] p-4 flex items-center justify-between ${
                currentWebsite?.id === site.id ? 'border-[3px] shadow-[4px_4px_0px_#4D79FF]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 border-[1.5px] border-black ${currentWebsite?.id === site.id ? 'bg-[#4DFFB4]' : 'bg-white'}`} />
                <div>
                  <p className="font-black text-sm">{site.name || site.domain}</p>
                  <p className="text-xs font-medium text-black/50">{site.domain}</p>
                  {site.githubRepo && (
                    <p className="text-xs font-medium text-black/40 flex items-center gap-1 mt-0.5">
                      <Github className="w-3 h-3" /> {site.githubOwner}/{site.githubRepo}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentWebsite(site)}
                className={`border-[2px] border-black px-3 py-1.5 text-xs font-black transition-all ${
                  currentWebsite?.id === site.id
                    ? 'bg-[#4DFFB4] shadow-[2px_2px_0px_#000]'
                    : 'bg-white hover:bg-[#FFE500] shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]'
                }`}
              >
                {currentWebsite?.id === site.id ? 'ACTIVE' : 'SELECT'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
