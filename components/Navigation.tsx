'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, User, LogOut } from 'lucide-react';
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
  if (
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin')
  ) {
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
  const getLogoutCallbackUrl = () => {
    if (typeof window === 'undefined') return '/';
    return new URL('/', window.location.origin).toString();
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <Image
            src="/logo.svg"
            alt="Ravi's"
            width={102}
            height={26}
            className="h-[18px] w-auto max-w-[90px] sm:h-5 sm:max-w-[100px] md:h-6 md:max-w-[110px]"
            priority
          />
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
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
            className="hidden md:inline-flex"
            onClick={() => {
              const confirmed = window.confirm('Avant de partir, souhaitez-vous vraiment vous déconnecter maintenant ?');
              if (!confirmed) return;
              signOut({ redirect: true, callbackUrl: getLogoutCallbackUrl() });
            }}
          >
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-3 py-3 space-y-2 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-2 px-2 pb-1">
              <Avatar className="h-7 w-7 border">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'Profil'} />
                <AvatarFallback>
                  {session.user.name?.slice(0, 1).toUpperCase() || <User className="h-3.5 w-3.5" />}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground truncate">{session.user.name}</p>
            </div>
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
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 mt-1"
              onClick={() => {
                const confirmed = window.confirm('Avant de partir, souhaitez-vous vraiment vous déconnecter maintenant ?');
                if (!confirmed) return;
                signOut({ redirect: true, callbackUrl: getLogoutCallbackUrl() });
              }}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

