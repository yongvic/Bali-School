'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoUploadSection } from '@/components/learning/VideoUploadSection';
import { toast } from 'sonner';
import { parseStructuredContent, type StructuredExercise } from '@/lib/learning-content';

interface Exercise {
  id: string;
  mode: string;
  exerciseType: string;
  skill: string;
  phase: string;
  title: string;
  description: string;
  content: string;
  pointsValue: number;
  completed: boolean;
  achievedScore: number;
}

const exerciseModeGuides: Record<string, { title: string; instructions: string[] }> = {
  PASSENGER: {
    title: 'Passenger Service',
    instructions: [
      'Read the passenger request in English.',
      'Record your response in English with a professional tone.',
      'Use cabin-service vocabulary.',
      'Keep your message clear and structured.',
    ],
  },
  ACCENT_TRAINING: {
    title: 'Accent Training',
    instructions: [
      'Listen to the model phrase.',
      'Record yourself repeating it clearly.',
      'Focus on stress and rhythm.',
      'Aim for intelligibility, not imitation.',
    ],
  },
  SECRET_CHALLENGE: {
    title: 'Secret Challenge',
    instructions: [
      'Read the random scenario in English.',
      'Respond naturally with confidence.',
      'Stay polite and solution-oriented.',
      'Use professional expressions.',
    ],
  },
  WHEEL_OF_ENGLISH: {
    title: 'Wheel of English',
    instructions: [
      'A random topic is selected.',
      'Speak for 60-120 seconds in English.',
      'Use aviation context when possible.',
      'Organize your response in short points.',
    ],
  },
  ROLE_PLAY: {
    title: 'Role Play',
    instructions: [
      'Follow the dialogue scenario in English.',
      'Play your role with realistic phrasing.',
      'Handle objections politely.',
      'Close the interaction professionally.',
    ],
  },
  LISTENING: {
    title: 'Listening',
    instructions: [
      'Listen attentively to the prompt.',
      'Extract key details.',
      'Answer in concise English.',
      'Re-check your response before submit.',
    ],
  },
  EMERGENCY: {
    title: 'Emergency Mode',
    instructions: [
      'Use exact safety wording.',
      'Speak slowly and clearly.',
      'Maintain authoritative tone.',
      'Avoid slang and ambiguity.',
    ],
  },
  CUSTOM: {
    title: 'Custom Exercise',
    instructions: [
      'Read the prompt carefully.',
      'Record a structured response in English.',
      'Keep answer relevant to scenario.',
      'Use professional vocabulary.',
    ],
  },
};

export default function ExercisePage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [correction, setCorrection] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error('Échec de récupération de l\'exercice');
        }
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        toast.error('Impossible de charger cet exercice');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Chargement de l&apos;exercice...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Exercice introuvable</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const modeGuide = exerciseModeGuides[exercise.mode] || exerciseModeGuides.CUSTOM;
  const isOralExercise = exercise.exerciseType === 'SPEAKING';
  const structured = parseStructuredContent(exercise.content);
  let currentExerciseFromContent: StructuredExercise | null = null;
  try {
    const parsed = JSON.parse(exercise.content || '{}');
    currentExerciseFromContent = (parsed?.currentExercise as StructuredExercise | undefined) || null;
  } catch {
    currentExerciseFromContent = null;
  }
  const interactiveExercise: StructuredExercise | null =
    currentExerciseFromContent || structured?.exercises?.[0] || null;

  const validateInteractive = async () => {
    if (!interactiveExercise) return;
    const expected =
      typeof interactiveExercise.answer === 'string'
        ? interactiveExercise.answer.toLowerCase()
        : Array.isArray(interactiveExercise.answer)
          ? interactiveExercise.answer.join(' ').toLowerCase()
          : JSON.stringify(interactiveExercise.answer).toLowerCase();

    const isCorrect = answer.trim().toLowerCase() === expected || answer.trim().toLowerCase().includes(expected);
    setCorrection(
      isCorrect
        ? `Bonne réponse. ${interactiveExercise.explanation || ''}`
        : `Réponse incorrecte. ${interactiveExercise.explanation || 'Revoyez la consigne puis réessayez.'}`
    );

    setSubmitting(true);
    try {
      const response = await fetch('/api/exercises/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          points: isCorrect ? exercise.pointsValue : Math.max(5, Math.round(exercise.pointsValue * 0.2)),
          mode: exercise.mode.toLowerCase(),
          exerciseType: exercise.exerciseType.toLowerCase(),
          skill: exercise.skill,
          achievedScore: isCorrect ? 100 : 45,
          title: exercise.title,
          content: exercise.content,
        }),
      });
      if (!response.ok) throw new Error('Échec de validation');
      toast.success('Exercice validé.');
    } catch (error) {
      toast.error('Impossible de valider cet exercice');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell py-8">
      <div className="page-container-md">
        <div className="page-header">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4 btn-mobile-full">
            Retour
          </Button>
          <h1 className="page-title mb-2 break-words sm:text-4xl">{exercise.title}</h1>
          <p className="page-subtitle break-words sm:text-lg">
            Compétence: {exercise.skill} - Type: {exercise.exerciseType}
          </p>
        </div>

        <Tabs defaultValue="instructions" className="space-y-6">
          <TabsList className={`grid h-auto w-full ${isOralExercise ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="instructions" className="text-xs sm:text-sm px-2">Consignes</TabsTrigger>
            <TabsTrigger value="scenario" className="text-xs sm:text-sm px-2">Scénario</TabsTrigger>
            {isOralExercise && <TabsTrigger value="record" className="text-xs sm:text-sm px-2">Enregistrer</TabsTrigger>}
          </TabsList>

          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{modeGuide.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {modeGuide.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-muted-foreground pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-6">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Conseil: répondez de manière claire, polie et structurée en anglais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scénario (EN)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {interactiveExercise?.prompt || structured?.listening?.dialogue || exercise.content}
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Rappelez-vous: l&apos;objectif est la qualité de communication professionnelle.
                  </p>
                </div>

                {!isOralExercise && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold">Exercice interactif</p>
                    {interactiveExercise ? (
                      <div className="space-y-3">
                        <p className="text-sm break-words">{interactiveExercise.prompt}</p>
                        {interactiveExercise.options && (
                          <p className="text-xs text-muted-foreground break-words">Options: {interactiveExercise.options.join(' | ')}</p>
                        )}
                        <input
                          className="w-full border rounded-md p-2 text-sm"
                          value={answer}
                          onChange={(event) => setAnswer(event.target.value)}
                          placeholder="Votre réponse"
                        />
                        <Button onClick={validateInteractive} disabled={submitting || !answer.trim()} className="w-full sm:w-auto">
                          {submitting ? 'Validation...' : `Valider (+${exercise.pointsValue} pts)`}
                        </Button>
                        {correction && <p className="text-sm text-muted-foreground">{correction}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ce scénario n&apos;a pas de question interactive structurée. Utilisez le module pour la partie pratique.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isOralExercise && <TabsContent value="record" className="space-y-4">
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">Enregistrer votre réponse</p>
              <p className="text-muted-foreground">{exercise.pointsValue} points Kiki pour cette validation</p>
            </div>
            <VideoUploadSection exerciseId={exerciseId} />
          </TabsContent>}
        </Tabs>
      </div>
    </div>
  );
}
