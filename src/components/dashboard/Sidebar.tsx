'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Megaphone,
  FileText,
  BarChart3,
  Settings,
  Globe,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { href: '/seo', label: 'SEO', icon: Search },
  { href: '/ads', label: 'ADS', icon: Megaphone },
  { href: '/landing-pages', label: 'LANDING PAGES', icon: FileText },
  { href: '/reports', label: 'AI REPORTS', icon: BarChart3 },
];

const bottomItems = [
  { href: '/settings', label: 'SETTINGS', icon: Settings },
  { href: '/settings/websites', label: 'WEBSITES', icon: Globe },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-black border-r-[3px] border-black flex flex-col shrink-0">
      {/* Logo */}
      <div className="border-b-[3px] border-[#FFE500]/30 p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFE500] border-[2px] border-[#FFE500] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <div>
            <div className="text-[#FFE500] font-black text-xs tracking-widest">AI MARKETING</div>
            <div className="text-white/50 font-bold text-[10px] tracking-widest">ANALYST</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-black tracking-wider transition-all',
                isActive
                  ? 'bg-[#FFE500] text-black border-[2px] border-[#FFE500] shadow-[3px_3px_0px_#FFE500]'
                  : 'text-white/70 hover:text-white hover:bg-white/10 border-[2px] border-transparent'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 3 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t-[2px] border-white/10 p-3 space-y-1">
        {bottomItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-black tracking-wider transition-all',
                isActive
                  ? 'bg-white/20 text-white border-[2px] border-white/30'
                  : 'text-white/50 hover:text-white hover:bg-white/10 border-[2px] border-transparent'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
