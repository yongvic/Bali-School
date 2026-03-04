'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseCard } from '@/components/learning/ExerciseCard';
import { toast } from 'sonner';
import { ProgressBar } from '@/components/learning/ProgressBar';
import { CircleCheckBig, ArrowRight, ArrowLeft, Volume2 } from 'lucide-react';
import { parseStructuredContent, type ModuleBlueprint, type StructuredExercise } from '@/lib/learning-content';

interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  targetPoints: number;
  exercises: {
    id: string;
    mode: string;
    exerciseType: string;
    skill: string;
    phase: string;
    title: string;
    description: string;
    pointsValue: number;
    completed: boolean;
    achievedScore: number;
    content?: string;
  }[];
}

export default function ModulePage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const moduleId = params.id as string;

  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weekProgress, setWeekProgress] = useState(0);
  const [blueprint, setBlueprint] = useState<ModuleBlueprint | null>(null);
  const [interactiveAnswers, setInteractiveAnswers] = useState<Record<string, string>>({});
  const [feedbackByExercise, setFeedbackByExercise] = useState<Record<string, string>>({});

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${moduleId}`);
        if (response.status === 423) {
          const data = await response.json();
          toast.error(data.message || 'Module bloqué');
          redirect('/learning-plan');
        }

        if (!response.ok) {
          throw new Error('Échec de récupération du module');
        }

        const data = await response.json();
        setModule(data);
        const firstStructured = data.exercises
          .map((exercise: { content?: string }) => parseStructuredContent(exercise.content || ''))
          .find(Boolean) as ModuleBlueprint | undefined;
        setBlueprint(firstStructured || null);

        const completedCount = data.exercises.filter((e: { completed: boolean }) => e.completed).length;
        const progress = data.exercises.length > 0 ? (completedCount / data.exercises.length) * 100 : 0;
        setWeekProgress(progress);
      } catch (error) {
        toast.error('Impossible de charger ce module');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Chargement du module...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Module introuvable</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const completedCount = module.exercises.filter((e) => e.completed).length;
  const earnedPoints = module.exercises
    .filter((e) => e.completed)
    .reduce((sum, e) => sum + e.pointsValue, 0);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Synthèse vocale non disponible sur ce navigateur.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const evaluateStructuredExercise = (exercise: StructuredExercise) => {
    const rawAnswer = interactiveAnswers[exercise.id]?.trim() || '';
    if (!rawAnswer) {
      setFeedbackByExercise((prev) => ({ ...prev, [exercise.id]: 'Réponse manquante.' }));
      return;
    }

    const expected =
      typeof exercise.answer === 'string'
        ? exercise.answer.toLowerCase()
        : Array.isArray(exercise.answer)
          ? exercise.answer.join(' ').toLowerCase()
          : JSON.stringify(exercise.answer).toLowerCase();

    const success = rawAnswer.toLowerCase() === expected || rawAnswer.toLowerCase().includes(expected);
    const explanation = exercise.explanation || 'Revoyez la règle et réessayez.';
    setFeedbackByExercise((prev) => ({
      ...prev,
      [exercise.id]: success ? `Correct. ${explanation}` : `Incorrect. ${explanation}`,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour au plan
          </Button>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Semaine {module.week}</h1>
              <p className="text-lg text-muted-foreground">{module.title}</p>
            </div>
            {module.description && <p className="text-muted-foreground">{module.description}</p>}
          </div>
        </div>

        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Progression hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar progress={weekProgress} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Exercices terminés</p>
                <p className="text-2xl font-bold">
                  {completedCount}/{module.exercises.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Kiki gagnés</p>
                <p className="text-2xl font-bold text-primary">
                  {earnedPoints}/{module.targetPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          {blueprint && (
            <div className="space-y-6 mb-8">
              <h2 className="text-2xl font-bold">Structure pédagogique du module</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Introduction pédagogique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Objectif:</span> {blueprint.introduction.objective}</p>
                  <p><span className="font-semibold text-foreground">Compétence ciblée:</span> {blueprint.introduction.skill}</p>
                  <p><span className="font-semibold text-foreground">Prérequis:</span> {blueprint.introduction.prerequisites}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vocabulaire ciblé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {blueprint.vocabulary.map((item) => (
                    <div key={item.word} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{item.word} - <span className="font-normal text-muted-foreground">{item.translation}</span></p>
                        <Button size="sm" variant="outline" onClick={() => speak(item.audioText)} className="gap-2">
                          <Volume2 className="w-4 h-4" /> Audio
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.example}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grammaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-semibold">Règle:</span> {blueprint.grammar.rule}</p>
                  {blueprint.grammar.examples.map((example) => <p key={example} className="text-muted-foreground">{example}</p>)}
                  <p><span className="font-semibold">Mini-exercice:</span> {blueprint.grammar.miniExercise}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compréhension orale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{blueprint.listening.dialogue}</p>
                  <Button size="sm" variant="outline" onClick={() => speak(blueprint.listening.dialogue)} className="gap-2">
                    <Volume2 className="w-4 h-4" /> Lire le dialogue
                  </Button>
                  <div className="space-y-1">
                    {blueprint.listening.questions.map((question) => <p key={question}>- {question}</p>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exercices interactifs auto-corrigés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {blueprint.exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-3 space-y-2">
                      <p className="font-semibold">{exercise.kind.toUpperCase()} - {exercise.prompt}</p>
                      {exercise.options && <p className="text-sm text-muted-foreground">Options: {exercise.options.join(' | ')}</p>}
                      <input
                        className="w-full border rounded-md p-2 text-sm"
                        value={interactiveAnswers[exercise.id] || ''}
                        onChange={(event) => setInteractiveAnswers((prev) => ({ ...prev, [exercise.id]: event.target.value }))}
                        placeholder="Votre réponse"
                      />
                      <div className="flex items-center gap-3">
                        <Button size="sm" onClick={() => evaluateStructuredExercise(exercise)}>Vérifier</Button>
                        {feedbackByExercise[exercise.id] && <p className="text-xs text-muted-foreground">{feedbackByExercise[exercise.id]}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6">Exercices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {module.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                id={exercise.id}
                moduleId={moduleId}
                mode={exercise.mode}
                title={exercise.title}
                description={`${exercise.description} • ${exercise.skill} • ${exercise.exerciseType}`}
                pointsValue={exercise.pointsValue}
                completed={exercise.completed}
              />
            ))}
          </div>
        </div>

        {weekProgress === 100 && (
          <Card className="mt-8 border-2 border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleCheckBig className="w-5 h-5 text-green-600" /> Semaine validée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Excellent travail. Vous pouvez continuer avec le module suivant.
              </p>
              <Button className="w-full gap-2">
                Module suivant <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
