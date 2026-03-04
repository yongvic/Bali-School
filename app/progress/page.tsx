'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Calendar, Target } from 'lucide-react';

interface ProgressData {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  exercisesCompleted: number;
  videosSubmitted: number;
  currentLevel: number;
  currentCefr: string;
  weeklyObjective: number;
  weeklyObjectiveReached: boolean;
  completionPercentage: number;
}

export default function ProgressPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? 'loading';
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/user/progress');
        if (!response.ok) throw new Error('Échec de récupération de progression');

        const data = await response.json();
        setProgress(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchProgress();
    }
  }, [session?.user?.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="page-container py-5 sm:py-6">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4 btn-mobile-full">Retour</Button>
          <h1 className="page-title">Votre progression</h1>
          <p className="page-subtitle">Suivez votre évolution semaine après semaine</p>
        </div>
      </div>

      <main className="page-container py-8 section-stack">
        {progress && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Points totaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{progress.totalPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" /> Cette semaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-500">{progress.weeklyPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" /> Ce mois-ci
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">{progress.monthlyPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Niveau</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{progress.currentLevel}</p>
                  <p className="text-xs text-muted-foreground mt-1">CEFR: {progress.currentCefr}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Objectif hebdomadaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
                  <span>{progress.weeklyPoints}/{progress.weeklyObjective} points</span>
                  <span className={progress.weeklyObjectiveReached ? 'text-green-600' : 'text-amber-600'}>
                    {progress.weeklyObjectiveReached ? 'Atteint' : 'Non atteint'}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.round((progress.weeklyPoints / Math.max(progress.weeklyObjective, 1)) * 100))}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progression globale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                    <span className="text-sm font-semibold">Achèvement du parcours</span>
                    <span className="text-sm text-muted-foreground">{progress.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500" style={{ width: `${progress.completionPercentage}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exercices terminés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{progress.exercisesCompleted}</p>
                  <p className="text-sm text-muted-foreground mt-2">Nombre total d&apos;exercices validés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vidéos soumises</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{progress.videosSubmitted}</p>
                  <p className="text-sm text-muted-foreground mt-2">Vidéos envoyées pour revue</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Insights pédagogiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-semibold text-sm mb-2">Points forts</p>
                  <p className="text-sm text-muted-foreground">Bonne progression sur les exercices pratiques et la compréhension.</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-semibold text-sm mb-2">Axes de travail</p>
                  <p className="text-sm text-muted-foreground">Renforcer la prononciation et la fluidité orale dans les scénarios avancés.</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}


