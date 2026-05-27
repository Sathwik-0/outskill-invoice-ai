'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Receipt, BookOpen, Bell, LogOut, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/helpers';
import type { User } from '@supabase/supabase-js';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', Icon: Receipt },
  { href: '/ledger', label: 'Ledger', Icon: BookOpen },
  { href: '/reminders', label: 'Reminders', Icon: Bell },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const businessName = (user.user_metadata?.business_name as string) || user.email?.split('@')[0] || 'My Business';

  return (
    <>
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-sage-100 px-4 py-6 z-10">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">O</span>
        </div>
        <div>
          <div className="font-display text-sm text-sage-900 leading-none">Outskill</div>
          <div className="text-xs text-gray-400 mt-0.5">Invoice AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-sage-50 text-sage-700 border border-sage-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sage-100 pt-4 mt-4">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
            <span className="text-sage-600 text-xs font-semibold">
              {businessName[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">{businessName}</div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-sage-100 bg-white/95 px-2 py-2 shadow-lg shadow-sage-200/70 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-all',
                active
                  ? 'bg-sage-50 text-sage-700'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
