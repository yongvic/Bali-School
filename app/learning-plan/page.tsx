'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Calendar, Target, Layers, Rocket } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Module {
  week: number;
  title: string;
  description: string;
  targetPoints: number;
}

interface LearningPlan {
  id: string;
  weeklyFocus: string[];
  estimatedCompletion: string;
  modules: Module[];
}

export default function LearningPlanPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? 'loading';
  const router = useRouter();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const [levelToApply, setLevelToApply] = useState('B1');
  const [focusInput, setFocusInput] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setJustGenerated(params.get('generated') === 'true');
    }
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/learning-plan');

        if (response.status === 404) {
          setPlan(null);
          return;
        }

        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message || 'Échec de chargement du plan');
        }

        const data = await response.json();
        setPlan(data);
      } catch (error) {
        toast.error('Impossible de charger votre plan');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'loading') return;
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    fetchPlan();
  }, [session?.user?.id, status, router]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/learning-plan/download-pdf');
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Échec du téléchargement PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plan-apprentissage.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Plan téléchargé avec succès');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de télécharger le PDF';
      toast.error(message);
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdatePlan = async () => {
    setIsUpdatingPlan(true);
    try {
      const weeklyFocus = focusInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch('/api/learning-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          englishLevel: levelToApply,
          weeklyFocus: weeklyFocus.length ? weeklyFocus : undefined,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Mise à jour impossible');
      }

      toast.success('Plan mis à jour. Rechargement...');
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec de mise à jour du plan');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Chargement du plan...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Aucun plan trouvé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Complétez votre onboarding pour générer votre plan personnalisé.</p>
            <Button onClick={() => router.push('/onboarding')} className="w-full">Démarrer l&apos;onboarding</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">Retour</Button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Votre plan sur 12 semaines</h1>
              <p className="text-lg text-muted-foreground">Feuille de route personnalisée pour l&apos;anglais aéronautique</p>
            </div>
            <Button onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">
              <Download className="w-4 h-4" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger le PDF'}
            </Button>
          </div>

          {justGenerated && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
              Votre plan personnalisé a été généré.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Durée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12 semaines</p>
              <p className="text-sm text-muted-foreground">Fin estimée: {new Date(plan.estimatedCompletion).toLocaleDateString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" /> Objectif hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3 000+</p>
              <p className="text-sm text-muted-foreground">points Kiki à gagner</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4" /> Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{plan.modules.length}</p>
              <p className="text-sm text-muted-foreground">modules hebdomadaires</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {[{ phase: 'Fondation', weeks: '1-4' }, { phase: 'Intermédiaire', weeks: '5-8' }, { phase: 'Avancé', weeks: '9-12' }].map((phase) => (
            <div key={phase.phase}>
              <div className="p-4 rounded-lg border bg-primary/5 border-primary/20 mb-4">
                <h3 className="text-lg font-semibold mb-2">Phase {phase.phase} (semaines {phase.weeks})</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.modules
                  .filter((m) => {
                    if (phase.weeks === '1-4') return m.week >= 1 && m.week <= 4;
                    if (phase.weeks === '5-8') return m.week >= 5 && m.week <= 8;
                    return m.week >= 9 && m.week <= 12;
                  })
                  .map((module) => (
                    <Card key={module.week}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Semaine {module.week}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm font-medium text-foreground">{module.title}</p>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs font-semibold text-primary">Objectif: {module.targetPoints} points Kiki</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-12 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" /> Prêt(e) à démarrer ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Votre plan est prêt. Commencez par la semaine 1 et progressez module par module.</p>
            <Button size="lg" className="w-full gap-2" onClick={() => router.push('/learn')}>
              Commencer la semaine 1
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Modifier mon plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Vous pouvez ajuster le niveau et les axes hebdomadaires sans refaire l&apos;onboarding.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input value={levelToApply} onChange={(event) => setLevelToApply(event.target.value.toUpperCase())} placeholder="Niveau (A1-C1)" />
              <Input
                className="md:col-span-2"
                value={focusInput}
                onChange={(event) => setFocusInput(event.target.value)}
                placeholder="Axes hebdomadaires séparés par des virgules"
              />
            </div>
            <Button onClick={handleUpdatePlan} disabled={isUpdatingPlan}>
              {isUpdatingPlan ? 'Mise à jour...' : 'Mettre à jour le plan'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
