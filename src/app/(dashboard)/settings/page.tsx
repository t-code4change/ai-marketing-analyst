'use client';

import { useWebsite } from '@/hooks/useWebsite';
import { useEffect, useState } from 'react';
import { Connection } from '@/types';
import { CheckCircle2, XCircle, ExternalLink, Github, BarChart3, Megaphone, Search } from 'lucide-react';

function ConnectionCard({
  type,
  label,
  icon: Icon,
  accentColor,
  connected,
  accountInfo,
  onConnect,
  onDisconnect,
}: {
  type: string;
  label: string;
  icon: any;
  accentColor: string;
  connected: boolean;
  accountInfo?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="border-[2px] border-black bg-white shadow-[3px_3px_0px_#000]">
      <div className="border-b-[2px] border-black px-4 py-3 flex items-center gap-3" style={{ backgroundColor: accentColor }}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-black text-sm uppercase tracking-wider">{label}</span>
        {connected ? (
          <CheckCircle2 className="w-4 h-4 ml-auto" strokeWidth={3} />
        ) : (
          <XCircle className="w-4 h-4 ml-auto text-black/40" strokeWidth={2} />
        )}
      </div>
      <div className="p-4">
        {connected ? (
          <div className="space-y-3">
            <div className="border-[1.5px] border-black bg-[#4DFFB4]/20 px-3 py-2">
              <p className="text-xs font-black text-black/50 uppercase">CONNECTED</p>
              {accountInfo && <p className="text-sm font-bold">{accountInfo}</p>}
            </div>
            <button
              onClick={onDisconnect}
              className="w-full border-[2px] border-black bg-[#FF6B6B] py-2 font-black text-xs shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              DISCONNECT
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="w-full border-[2px] border-black bg-black text-white py-2.5 font-black text-xs shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
            CONNECT {label.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentWebsite } = useWebsite();
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (!currentWebsite?.id) return;
    fetch(`/api/connections?websiteId=${currentWebsite.id}`)
      .then(r => r.ok ? r.json() : { connections: [] })
      .then(d => setConnections(d.connections || []));
  }, [currentWebsite?.id]);

  function isConnected(type: string) {
    return connections.some(c => c.type === type && c.connected);
  }

  function connectGoogle() {
    if (!currentWebsite?.id) return;
    window.location.href = `/api/connect/google?websiteId=${currentWebsite.id}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl tracking-tight">SETTINGS</h1>
        <p className="text-sm font-bold text-black/50 uppercase tracking-wider">MANAGE CONNECTIONS</p>
      </div>

      {!currentWebsite ? (
        <div className="border-[3px] border-black bg-[#FFE500] shadow-[6px_6px_0px_#000] p-6">
          <p className="font-black">Select or add a website first to manage connections.</p>
        </div>
      ) : (
        <>
          <div className="border-[2px] border-black bg-[#FFFEF0] px-4 py-3 shadow-[2px_2px_0px_#000]">
            <p className="text-xs font-black text-black/50 uppercase tracking-wider">CURRENT WEBSITE</p>
            <p className="font-black text-lg">{currentWebsite.domain}</p>
          </div>

          <h2 className="font-black text-sm uppercase tracking-widest">GOOGLE INTEGRATIONS</h2>
          <p className="text-xs font-medium text-black/60 -mt-4">
            Connecting Google will grant access to Analytics, Search Console, and Ads.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConnectionCard
              type="analytics"
              label="Google Analytics"
              icon={BarChart3}
              accentColor="#4D79FF"
              connected={isConnected('analytics')}
              onConnect={connectGoogle}
              onDisconnect={() => {}}
            />
            <ConnectionCard
              type="search_console"
              label="Search Console"
              icon={Search}
              accentColor="#4DFFB4"
              connected={isConnected('search_console')}
              onConnect={connectGoogle}
              onDisconnect={() => {}}
            />
            <ConnectionCard
              type="ads"
              label="Google Ads"
              icon={Megaphone}
              accentColor="#FFE500"
              connected={isConnected('ads')}
              onConnect={connectGoogle}
              onDisconnect={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
}
