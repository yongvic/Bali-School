'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Calendar, Target, Layers, Rocket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { levelByWeek } from '@/lib/learning-content';

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
  goals30: string[];
  goals60: string[];
  goals90: string[];
  weeklyObjectives: string[];
  skillFocuses: string[];
  exerciseSuggestions: string[];
}

export default function LearningPlanPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? 'loading';
  const router = useRouter();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // isDownloading kept for API compatibility but unused now
  const [isDownloading] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const [levelToApply, setLevelToApply] = useState('B1');
  const [focusInput, setFocusInput] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [weeklyObjectivesInput, setWeeklyObjectivesInput] = useState('');
  const [skillFocusesInput, setSkillFocusesInput] = useState('');
  const [exerciseSuggestionsInput, setExerciseSuggestionsInput] = useState('');

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
        setWeeklyObjectivesInput(data.weeklyObjectives?.join('\n') || '');
        setSkillFocusesInput(data.skillFocuses?.join('\n') || '');
        setExerciseSuggestionsInput(data.exerciseSuggestions?.join('\n') || '');
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

  const handleDownloadPDF = () => {
    // Open the print page in a new tab — the browser handles PDF generation natively
    window.open('/learning-plan/print', '_blank');
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
          weeklyObjectives: weeklyObjectivesInput
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
          skillFocuses: skillFocusesInput
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
          exerciseSuggestions: exerciseSuggestionsInput
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
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
    <div className="page-shell py-8 sm:py-12">
      <div className="page-container-md">
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">Retour</Button>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="page-title mb-2 sm:text-4xl">Votre plan sur 12 semaines</h1>
              <p className="page-subtitle sm:text-lg">Feuille de route personnalisée pour l&apos;anglais aéronautique</p>
            </div>
            <Button onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2 w-full sm:w-auto">
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
          <div className="space-y-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold">Objectifs 30 / 60 / 90 jours</h3>
                <p className="text-sm text-muted-foreground">Votre feuille de route rapide</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: '30 jours', goals: plan.goals30 || [] },
                { label: '60 jours', goals: plan.goals60 || [] },
                { label: '90 jours', goals: plan.goals90 || [] },
              ].map((group) => (
                <Card key={group.label} className="bg-card border border-border">
                  <CardHeader>
                    <CardTitle>{group.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {group.goals.map((goal, index) => (
                      <p key={`${group.label}-${index}`} className="leading-relaxed">
                        {goal}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Objectifs hebdomadaires</h3>
            <p className="text-sm text-muted-foreground">La direction de chaque semaine</p>
            <Card className="border border-border bg-card/80">
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {(plan.weeklyObjectives || []).map((objective, index) => (
                    <li key={objective} className="rounded-md border border-border p-3">
                      <span className="font-semibold text-foreground">Semaine {index + 1} :</span>
                      <p className="text-xs text-muted-foreground mt-1">{objective}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border bg-card/80">
              <CardHeader>
                <CardTitle>Compétences à maîtriser</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-foreground">
                {(plan.skillFocuses || []).map((skill) => (
                  <div key={skill} className="rounded-md border border-border bg-background px-3 py-2">
                    {skill}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-border bg-card/80">
              <CardHeader>
                <CardTitle>Exercices adaptés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-foreground">
                {(plan.exerciseSuggestions || []).map((exercise) => (
                  <div key={exercise} className="rounded-md border border-border bg-background px-3 py-2">
                    {exercise}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

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
                        <CardTitle className="text-base flex items-center justify-between gap-2">
                          <span>Semaine {module.week}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                            {levelByWeek(module.week)}
                          </span>
                        </CardTitle>
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
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label>Objectifs hebdomadaires (une ligne = une semaine)</Label>
                <textarea
                  value={weeklyObjectivesInput}
                  onChange={(event) => setWeeklyObjectivesInput(event.target.value)}
                  className="w-full resize-y p-2 border border-border rounded-md bg-background"
                  rows={4}
                  placeholder="Semaine 1 : ...&#10;Semaine 2 : ..."
                />
              </div>
              <div className="space-y-1">
                <Label>Compétences à renforcer (ligne par compétence)</Label>
                <textarea
                  value={skillFocusesInput}
                  onChange={(event) => setSkillFocusesInput(event.target.value)}
                  className="w-full resize-y p-2 border border-border rounded-md bg-background"
                  rows={3}
                  placeholder="Prononciation claire&#10;Vocabulaire cabine"
                />
              </div>
              <div className="space-y-1">
                <Label>Exercices suggérés (une ligne par exercice)</Label>
                <textarea
                  value={exerciseSuggestionsInput}
                  onChange={(event) => setExerciseSuggestionsInput(event.target.value)}
                  className="w-full resize-y p-2 border border-border rounded-md bg-background"
                  rows={3}
                  placeholder="Réponses rapides sur les procédures&#10;Vidéo de 1min"
                />
              </div>
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
