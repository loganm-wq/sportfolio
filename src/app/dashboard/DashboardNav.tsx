'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/(auth)/actions';

const TABS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Log Expense', href: '/dashboard/log' },
  { label: 'Sports', href: '/dashboard/sports' },
  { label: 'Events', href: '/dashboard/events' },
  { label: 'Insights', href: '/dashboard/insights' },
];

export default function DashboardNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-14">
        {/* Logo */}
        <span className="font-bold text-white text-base tracking-tight mr-8 flex-shrink-0">
          Sportfolio
        </span>

        {/* Tabs */}
        <div className="flex items-center flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => {
            const isActive =
              tab.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`h-14 flex items-center px-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'text-white border-lime-400'
                    : 'text-[#555] border-transparent hover:text-[#888]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* User + sign out */}
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {userEmail && (
            <span className="text-[#444] text-xs hidden md:block truncate max-w-[180px]">
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-[#555] hover:text-white border border-[#222] hover:border-[#444] px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
