'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LogOut,
  ArrowRight,
  Shield,
  GraduationCap,
  Trophy,
  ChartColumnIncreasing,
  ClipboardList,
  PlayCircle,
  Video,
  BarChart3,
  MessageCircle,
  Bell,
  Gift,
  Map,
  Sparkles,
  Settings,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const router = useRouter();
  const { data: stats, isLoading } = useSWR('/api/dashboard/stats', fetcher);
  const { data: learningPlan } = useSWR('/api/learning-plan', async (url) => {
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json();
  });

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Merci pour votre effort aujourd’hui. Voulez-vous vraiment vous déconnecter ?');
    if (!confirmed) return;
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const cards = [
    {
      title: "Plan d'apprentissage",
      description: 'Votre parcours personnalisé sur 12 semaines',
      icon: ClipboardList,
      action: () => router.push('/learning-plan'),
      buttonText: 'Voir le plan',
    },
    {
      title: 'Mon profil',
      description: 'Modifiez votre nom et votre photo de profil',
      icon: User,
      action: () => router.push('/profile'),
      buttonText: 'Gérer le profil',
    },
    {
      title: 'Commencer les exercices',
      description: 'Réalisez des activités interactives et gagnez des points Kiki',
      icon: PlayCircle,
      action: () => router.push('/learn'),
      buttonText: 'Commencer',
    },
    {
      title: 'Soumettre une vidéo',
      description: 'Envoyez votre production orale pour validation',
      icon: Video,
      action: () => router.push('/submit-video'),
      buttonText: 'Soumettre',
    },
    {
      title: 'Récompenses',
      description: 'Suivez vos badges et vos points Kiki',
      icon: Trophy,
      action: () => router.push('/gamification'),
      buttonText: 'Voir les badges',
    },
    {
      title: 'Ma progression',
      description: "Consultez vos statistiques d'apprentissage",
      icon: BarChart3,
      action: () => router.push('/progress'),
      buttonText: 'Voir les stats',
    },
    {
      title: 'Aide et support',
      description: 'Consultez les réponses aux questions fréquentes',
      icon: MessageCircle,
      action: () => router.push('/support'),
      buttonText: "Obtenir de l'aide",
    },
    {
      title: 'Notifications',
      description: 'Suivez les mises à jour de vos soumissions et badges',
      icon: Bell,
      action: () => router.push('/notifications'),
      buttonText: 'Voir les notifications',
    },
    {
      title: 'Boîte à idées',
      description: "Proposez des idées d'exercices et de scénarios",
      icon: Gift,
      action: () => router.push('/wishes'),
      buttonText: 'Gérer mes souhaits',
    },
    {
      title: 'Carte aéroport',
      description: 'Visualisez votre progression par terminal',
      icon: Map,
      action: () => router.push('/airport-map'),
      buttonText: 'Voir la carte',
    },
  ];

  return (
    <div className="page-shell">
      <div className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex flex-wrap items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Ravi's"
              width={120}
              height={30}
              className="h-5 w-auto max-w-[98px] sm:h-6 sm:max-w-[112px]"
              priority
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border">
              <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'Profil'} />
              <AvatarFallback>
                {session.user.name?.slice(0, 1).toUpperCase() || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Bienvenue,</p>
              <p className="font-semibold truncate max-w-36">{session.user.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 h-8 px-2.5 md:h-9 md:px-3">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="page-container py-8 sm:py-12">
        <div className="section-stack">
          <div className="flex gap-4 flex-wrap">
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm inline-flex items-center gap-2">
              {session.user.role === 'ADMIN' ? (
                <>
                  <Shield className="w-4 h-4" />
                  Administrateur
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Élève
                </>
              )}
            </div>
            {!isLoading && stats && (
              <>
                <div className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 font-semibold text-sm inline-flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {stats.totalPoints} points
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-700 font-semibold text-sm inline-flex items-center gap-2">
                  <ChartColumnIncreasing className="w-4 h-4" />
                  {stats.badgesUnlocked} badges
                </div>
                {Array.isArray(stats.badges) &&
                  stats.badges
                    .filter((badge: string) => badge.startsWith('LEVEL_'))
                    .map((levelBadge: string) => (
                      <div key={levelBadge} className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-700 font-semibold text-sm inline-flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Badge {levelBadge.replace('LEVEL_', '')}
                      </div>
                    ))}
              </>
            )}
          </div>

          {!isLoading && stats && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Objectif hebdomadaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.round((stats.weeklyPoints / 300) * 100))}%` }} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.weeklyPoints}/300 points
                  {stats.weeklyPoints >= 300
                    ? ' - Objectif atteint, fonctionnalités bonus débloquées.'
                    : ` - Objectif non atteint, encore ${300 - stats.weeklyPoints} points.`}
                </p>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="page-title mb-4 sm:text-4xl">Tableau de bord d&apos;apprentissage</h2>
            <p className="page-subtitle sm:text-lg">
              Retrouvez toutes vos fonctionnalités de progression et de pratique de l&apos;anglais professionnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className="w-7 h-7 text-primary mb-2" />
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Button variant="outline" size="sm" onClick={item.action} className="w-full">
                      {item.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {learningPlan && session.user.role === 'STUDENT' && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Votre plan personnalisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Objectif 30 jours : {learningPlan.goals30?.[0] || 'Débuter forte'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Compétence prioritaire : {learningPlan.skillFocuses?.[0] || 'Communication professionnelle'}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.push('/learning-plan')}>
                    Voir le plan
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => router.push('/learning-plan')}>
                    Télécharger le plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {session.user.role === 'STUDENT' && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Prochaines étapes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Finalisez votre onboarding pour obtenir un plan personnalisé.
                </p>
                <Button className="gap-2 w-full sm:w-auto" onClick={() => router.push('/onboarding')}>
                  Commencer l&apos;onboarding
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {session.user.role === 'ADMIN' && (
            <Card className="border-2 border-amber-500/20 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Espace administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Accédez aux outils de revue des vidéos et de suivi des élèves.
                </p>
                <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => router.push('/admin')}>
                  Aller au tableau admin
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

