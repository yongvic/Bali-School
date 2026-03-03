'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/learning-plan', label: 'Learning Plan' },
    { href: '/gamification', label: 'Achievements' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Admin' },
  ];

  const links = session.user.role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">✈️</span>
          <span>Bali&apos;s School</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? 'default' : 'ghost'}
                size="sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{session.user.name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ redirect: true, redirectUrl: '/' })}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-3 space-y-2">
            {links.map(link => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
