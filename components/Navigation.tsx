'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navigation() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  // Avoid duplicate headers on pages that already render a dedicated top bar.
  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const studentLinks = [
    { href: '/dashboard', label: 'Tableau de bord' },
    { href: '/profile', label: 'Profil' },
    { href: '/learning-plan', label: "Plan d'apprentissage" },
    { href: '/gamification', label: 'Récompenses' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/wishes', label: 'Boîte à idées' },
    { href: '/airport-map', label: 'Carte aéroport' },
  ];

  const adminLinks = [
    { href: '/profile', label: 'Profil' },
    { href: '/admin/dashboard', label: 'Administration' },
  ];

  const links = session.user.role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Image src="/logo.svg" alt="Ravi's" width={120} height={30} className="h-7 w-auto max-w-[120px] md:h-6 md:max-w-[110px]" priority />
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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'Profil'} />
              <AvatarFallback>
                {session.user.name?.slice(0, 1).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span>{session.user.name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const confirmed = window.confirm('Avant de partir, souhaitez-vous vraiment vous déconnecter maintenant ?');
              if (!confirmed) return;
              signOut({ redirect: true, callbackUrl: '/' });
            }}
          >
            Déconnexion
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


