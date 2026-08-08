'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PhoneCall, FileText, BarChart3, BookOpen,
  Menu, X, Bot, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/live-call', label: 'Live Call', icon: PhoneCall },
  { href: '/post-call', label: 'Post-Call', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">SalesAI Co-Pilot</p>
            <p className="text-xs text-muted-foreground">Voice Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 px-3">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <Badge variant="outline" className="text-xs font-normal border-success/40 text-success">
              Compliance Active
            </Badge>
          </div>
          <div className="px-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Pay-in-3 Knowledge v2.1</p>
            <p>Effective: Jan 15, 2025</p>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold">SalesAI</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="h-9 w-9">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-14 bg-background/95 backdrop-blur">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">AI Co-Pilot Online</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success" />
              Demo Mode
            </Badge>
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
