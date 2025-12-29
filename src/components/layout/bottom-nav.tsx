'use client';

import { BookOpen, Settings, Shuffle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Sparkles, label: 'Generate' },
  { href: '/discover', icon: Shuffle, label: 'Discover' },
  { href: '/plan', icon: BookOpen, label: 'Plan' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
      <nav className="h-full">
        <ul className="flex justify-around items-center h-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
