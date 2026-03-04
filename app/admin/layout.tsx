'use client';

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Clapperboard,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin#pending', label: 'Vidéos en attente', icon: Clapperboard },
  { href: '/admin#students', label: 'Élèves', icon: Users },
  { href: '/admin#content', label: 'Contenu et récompenses', icon: BookOpen },
];

const pageTitles: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/review': 'Revue vidéo',
  '/admin/students': 'Détail élève',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sessionState = useSession();
  const session = sessionState?.data;
  const normalizedPath = useMemo(() => {
    if (pathname.startsWith('/admin/review')) return '/admin/review';
    if (pathname.startsWith('/admin/students')) return '/admin/students';
    return '/admin';
  }, [pathname]);

  const title = pageTitles[normalizedPath] || 'Espace administration';

  const isActiveLink = (href: string) => {
    const base = href.split('#')[0];
    if (!base) return false;
    if (base === '/admin') return pathname === '/admin';
    return pathname.startsWith(base);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const renderSidebarContent = (mobile = false) => (
    <>
      <Link href="/admin" className="flex items-center gap-2 text-xl font-semibold text-white" onClick={closeMenu}>
        <Image
          src="/logo.svg"
          alt="Ravi's Admin"
          width={114}
          height={28}
          className="h-6 w-auto max-w-[114px] brightness-0 invert"
        />
      </Link>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mt-2">Ravi&apos;s School</p>

      <nav className="mt-8 flex-1 space-y-2">
        {sidebarLinks.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link key={link.href} href={link.href} onClick={closeMenu}>
              <Button
                variant={isActiveLink(link.href) ? 'default' : 'ghost'}
                className="w-full justify-start gap-2 text-sm font-medium"
                size="sm"
              >
                <LinkIcon className="h-4 w-4" />
                <span>{link.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-slate-800 pt-4 space-y-2">
        {session?.user && (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Connecté</p>
            <p className="text-sm font-semibold text-white line-clamp-1">{session.user.name || session.user.email}</p>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
      {mobile && <p className="pt-2 text-[11px] text-slate-500">Menu administration</p>}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-900 bg-slate-900 px-6 py-8 lg:flex lg:flex-col">
          {renderSidebarContent()}
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="border-b border-slate-900 bg-slate-950 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Admin • Gestion</p>
                <h1 className="text-xl font-semibold text-white mt-1 sm:text-2xl truncate">{title}</h1>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Ouvrir le menu administration"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </header>
          {isMobileMenuOpen && (
            <div className="lg:hidden border-b border-slate-900 bg-slate-900 px-4 py-4">
              <div className="mx-auto max-w-6xl flex flex-col">{renderSidebarContent(true)}</div>
            </div>
          )}
          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
