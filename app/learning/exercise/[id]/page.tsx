'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { parseStructuredContent, type StructuredExercise, computeOralScore } from '@/lib/learning-content';

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

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const exerciseModeGuides: Record<string, { title: string; instructions: string[] }> = {
  PASSENGER: {
    title: 'Service passager',
    instructions: [
      'Lisez la demande du passager.',
      'Répondez en anglais avec un ton professionnel.',
      'Utilisez du vocabulaire cabine adapté.',
      'Structurez votre message en phrases courtes et claires.',
    ],
  },
  ACCENT_TRAINING: {
    title: 'Entraînement accent',
    instructions: [
      'Écoutez la phrase modèle.',
      'Répétez-la distinctement.',
      'Travaillez le rythme et l’intonation.',
      'Visez la clarté avant tout.',
    ],
  },
  SECRET_CHALLENGE: {
    title: 'Défi surprise',
    instructions: [
      'Lisez le scénario affiché.',
      'Répondez de façon naturelle.',
      'Restez poli et orienté solution.',
      'Employez des formulations professionnelles.',
    ],
  },
  WHEEL_OF_ENGLISH: {
    title: "Roue d'anglais",
    instructions: [
      'Le sujet est tiré aléatoirement.',
      'Parlez 60 à 120 secondes.',
      'Restez dans le contexte aérien.',
      'Présentez votre réponse en 2-3 idées.',
    ],
  },
  ROLE_PLAY: {
    title: 'Jeu de rôle',
    instructions: [
      'Suivez la situation proposée.',
      'Tenez votre rôle avec un langage crédible.',
      'Gérez les objections avec calme.',
      'Terminez la conversation proprement.',
    ],
  },
  LISTENING: {
    title: 'Compréhension orale',
    instructions: [
      'Écoutez le contenu attentivement.',
      'Identifiez les informations clés.',
      'Répondez en anglais de manière concise.',
      'Relisez votre réponse avant validation.',
    ],
  },
  EMERGENCY: {
    title: 'Mode urgence',
    instructions: [
      'Utilisez les formules de sécurité exactes.',
      'Parlez lentement et clairement.',
      'Gardez un ton ferme et professionnel.',
      'Évitez les expressions ambiguës.',
    ],
  },
  CUSTOM: {
    title: 'Exercice personnalisé',
    instructions: [
      'Lisez la consigne en entier.',
      'Répondez de manière structurée.',
      'Restez aligné avec le scénario.',
      'Utilisez un anglais professionnel.',
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
  const [matchAnswers, setMatchAnswers] = useState<Record<string, string>>({});
  const [correction, setCorrection] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [oralTranscript, setOralTranscript] = useState('');
  const [oralScore, setOralScore] = useState<number | null>(null);
  const [oralFeedback, setOralFeedback] = useState('');
  const [submittingAudio, setSubmittingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error("Échec de récupération de l'exercice");
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

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
    };
  }, [audioUrl]);

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
    const parsed = JSON.parse(exercise.content || '{}') as { currentExercise?: StructuredExercise };
    currentExerciseFromContent = parsed?.currentExercise || null;
  } catch {
    currentExerciseFromContent = null;
  }
  const interactiveExercise: StructuredExercise | null = currentExerciseFromContent || structured?.exercises?.[0] || null;
  const expectedPhrase = extractExpectedPhrase(interactiveExercise?.prompt || exercise.content);
  const isMatchPairsExercise =
    interactiveExercise?.kind === 'match_pairs' &&
    interactiveExercise.answer &&
    typeof interactiveExercise.answer === 'object' &&
    !Array.isArray(interactiveExercise.answer);
  const canSubmitInteractive = isMatchPairsExercise ? true : answer.trim().length > 0;

  const validateInteractive = async () => {
    if (!interactiveExercise) return;
    let isCorrect = false;

    if (
      interactiveExercise.kind === 'match_pairs' &&
      interactiveExercise.answer &&
      typeof interactiveExercise.answer === 'object' &&
      !Array.isArray(interactiveExercise.answer)
    ) {
      const expectedPairs = interactiveExercise.answer as Record<string, string>;
      const allKeys = Object.keys(expectedPairs);
      const allAnswered = allKeys.every((key) => Boolean(matchAnswers[key]));
      if (!allAnswered) {
        toast.error('Associez tous les mots avant de valider.');
        return;
      }
      isCorrect = allKeys.every((key) => {
        const picked = (matchAnswers[key] || '').trim().toLowerCase();
        const expected = (expectedPairs[key] || '').trim().toLowerCase();
        return picked === expected;
      });
    } else {
      const expected =
        typeof interactiveExercise.answer === 'string'
          ? interactiveExercise.answer.toLowerCase()
          : Array.isArray(interactiveExercise.answer)
            ? interactiveExercise.answer.join(' ').toLowerCase()
            : JSON.stringify(interactiveExercise.answer).toLowerCase();
      isCorrect = answer.trim().toLowerCase() === expected || answer.trim().toLowerCase().includes(expected);
    }

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
          achievedScore: isCorrect ? 100 : 45,
          title: exercise.title,
          content: exercise.content,
        }),
      });
      if (!response.ok) throw new Error('Échec de validation');
      setExercise((prev) => (prev ? { ...prev, completed: true, achievedScore: isCorrect ? 100 : 45 } : prev));
      toast.success('Exercice validé.');
    } catch (error) {
      toast.error('Impossible de valider cet exercice');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setOralTranscript('');
      setOralScore(null);
      setOralFeedback('');

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
      };

      const recognitionHost = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const SpeechRecognitionConstructor = recognitionHost.SpeechRecognition || recognitionHost.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          const value = event.results?.[0]?.[0]?.transcript || '';
          setOralTranscript(value);
          const result = computeOralScore(value, expectedPhrase);
          setOralScore(result.score);
          setOralFeedback(result.feedback);
        };
        recognition.onerror = () => {
          toast.error('Transcription indisponible pour cet essai.');
        };
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        toast.info('Transcription automatique non disponible sur ce navigateur.');
      }

      recorder.start();
      setIsAudioRecording(true);
      toast.success('Enregistrement audio démarré.');
    } catch (error) {
      toast.error("Impossible d'accéder au micro.");
      console.error(error);
    }
  };

  const stopAudioRecording = () => {
    if (!isAudioRecording) return;
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current?.stop();
    setIsAudioRecording(false);

    if (!oralTranscript) {
      const result = computeOralScore('', expectedPhrase);
      setOralScore(result.score);
      setOralFeedback('Aucune transcription détectée. Vous pouvez réessayer pour améliorer la note.');
    }
  };

  const submitAudioAnswer = async () => {
    if (!audioBlob) {
      toast.error('Enregistrez une note vocale avant validation.');
      return;
    }

    setSubmittingAudio(true);
    try {
      const score = oralScore ?? 70;
      const response = await fetch('/api/exercises/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          content: interactiveExercise?.prompt || exercise.content,
          transcript: oralTranscript,
          expectedPhrase,
          oralScore: score,
          oralFeedback,
          achievedScore: score,
          title: exercise.title,
        }),
      });

      if (!response.ok) throw new Error('Échec de validation orale');
      setExercise((prev) => (prev ? { ...prev, completed: true, achievedScore: score } : prev));
      toast.success(`Note vocale validée (+${exercise.pointsValue} points).`);
    } catch (error) {
      toast.error('Impossible de valider la note vocale');
      console.error(error);
    } finally {
      setSubmittingAudio(false);
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
          {exercise.completed && (
            <p className="text-sm mt-2 text-green-600 dark:text-green-400">
              Exercice déjà validé (score: {exercise.achievedScore}/100)
            </p>
          )}
        </div>

        <Tabs defaultValue="instructions" className="space-y-6">
          <TabsList className={`grid h-auto w-full ${isOralExercise ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="instructions" className="text-xs sm:text-sm px-2">Consignes</TabsTrigger>
            <TabsTrigger value="scenario" className="text-xs sm:text-sm px-2">Scénario</TabsTrigger>
            {isOralExercise && <TabsTrigger value="audio" className="text-xs sm:text-sm px-2">Note vocale</TabsTrigger>}
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
                    Conseil: privilégiez des phrases courtes, polies et adaptées à la situation cabine.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scénario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {interactiveExercise?.prompt || structured?.listening?.dialogue || exercise.content}
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Objectif: communiquer de façon professionnelle et compréhensible.
                  </p>
                </div>

                {!isOralExercise && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold">Exercice interactif</p>
                    {interactiveExercise ? (
                      <div className="space-y-3">
                        <p className="text-sm break-words">{interactiveExercise.prompt}</p>
                        {interactiveExercise.kind === 'match_pairs' &&
                        interactiveExercise.answer &&
                        typeof interactiveExercise.answer === 'object' &&
                        !Array.isArray(interactiveExercise.answer) ? (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Associez chaque mot anglais à sa traduction française.</p>
                            {Object.entries(interactiveExercise.answer as Record<string, string>).map(([englishWord], index) => {
                              const allTranslations = Object.values(interactiveExercise.answer as Record<string, string>);
                              return (
                                <div key={englishWord} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 rounded-md border p-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Mot {index + 1}</p>
                                    <p className="font-medium">{englishWord}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Traduction</p>
                                    <select
                                      className="w-full border rounded-md p-2 text-sm bg-background"
                                      value={matchAnswers[englishWord] || ''}
                                      onChange={(event) =>
                                        setMatchAnswers((prev) => ({
                                          ...prev,
                                          [englishWord]: event.target.value,
                                        }))
                                      }
                                    >
                                      <option value="">Choisir une traduction</option>
                                      {allTranslations.map((translation) => (
                                        <option key={`${englishWord}-${translation}`} value={translation}>
                                          {translation}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <>
                            {interactiveExercise.options && (
                              <p className="text-xs text-muted-foreground break-words">Options: {interactiveExercise.options.join(' | ')}</p>
                            )}
                            <input
                              className="w-full border rounded-md p-2 text-sm"
                              value={answer}
                              onChange={(event) => setAnswer(event.target.value)}
                              placeholder="Votre réponse"
                            />
                          </>
                        )}
                        <Button onClick={validateInteractive} disabled={submitting || !canSubmitInteractive} className="w-full sm:w-auto">
                          {submitting ? 'Validation...' : `Valider (+${exercise.pointsValue} pts)`}
                        </Button>
                        {correction && <p className="text-sm text-muted-foreground">{correction}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ce scénario n&apos;a pas de question interactive structurée.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isOralExercise && (
            <TabsContent value="audio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Production orale: note vocale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enregistrez votre réponse avec le micro, puis validez pour compléter l&apos;exercice.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={isAudioRecording ? stopAudioRecording : startAudioRecording} variant={isAudioRecording ? 'destructive' : 'default'}>
                      {isAudioRecording ? "Arrêter l'enregistrement" : 'Démarrer la note vocale'}
                    </Button>
                    <Button onClick={submitAudioAnswer} disabled={submittingAudio || !audioBlob || exercise.completed} variant="outline">
                      {submittingAudio ? 'Validation...' : `Valider la note (+${exercise.pointsValue} pts)`}
                    </Button>
                  </div>

                  {audioUrl && (
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/webm" />
                    </audio>
                  )}

                  <div className="space-y-2 rounded-md border p-3">
                    <p className="text-sm"><strong>Phrase attendue:</strong> {expectedPhrase}</p>
                    <p className="text-sm"><strong>Transcription:</strong> {oralTranscript || 'Aucune transcription détectée.'}</p>
                    {oralScore !== null && (
                      <p className="text-sm"><strong>Score oral:</strong> {oralScore}/100 - {oralFeedback}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function extractExpectedPhrase(prompt: string): string {
  const quoted = prompt.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];
  return prompt;
}
