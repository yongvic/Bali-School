'use client';

import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Clapperboard,
  Users,
  BookOpen,
  ShieldCheck,
  LogOut,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-900 bg-slate-900 px-6 py-8 flex flex-col">
          <Link href="/admin" className="flex items-center gap-2 text-xl font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span>Admin Center</span>
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-2">Ravi&apos;s School</p>

          <nav className="mt-10 flex-1 space-y-2">
            {sidebarLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Connecté</p>
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {session.user.name || session.user.email}
                </p>
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
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="border-b border-slate-900 bg-slate-950 px-6 py-6 shadow-sm">
            <div className="max-w-6xl mx-auto">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin • Gestion</p>
              <h1 className="text-2xl font-semibold text-white mt-1">{title}</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto px-6 py-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
