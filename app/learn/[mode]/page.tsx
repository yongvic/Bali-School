'use client';

import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Volume2, Mic, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { computeOralScore } from '@/lib/learning-content';

type Scenario = {
  id: number;
  prompt: string;
  points: number;
  pronunciationWord?: string;
};

type ExerciseContent = {
  title: string;
  description: string;
  scenarios: Scenario[];
};

const exerciseContent: Record<string, ExerciseContent> = {
  reading: {
    title: 'Lecture en anglais',
    description: 'Lisez puis répondez en anglais.',
    scenarios: [
      { id: 1, prompt: 'Read: "Welcome aboard. Today we are flying to Singapore." Then summarize it in one sentence.', points: 40 },
      { id: 2, prompt: 'Read: "Please place your bags in the overhead compartment." Then rephrase politely.', points: 40 },
    ],
  },
  quiz: {
    title: 'Quiz',
    description: 'Répondez aux questions en anglais.',
    scenarios: [
      { id: 1, prompt: 'Question: What is the correct phrase to request seat belt fastening?', points: 45 },
      { id: 2, prompt: 'Question: Which phrase is most professional for meal service?', points: 45 },
    ],
  },
  vocabulary: {
    title: 'Vocabulaire',
    description: 'Utilisez le vocabulaire aéronautique en contexte.',
    scenarios: [
      { id: 1, prompt: 'Use these words in a sentence: "turbulence", "galley", "boarding pass".', points: 50 },
      { id: 2, prompt: 'Explain the difference between "aisle" and "emergency exit".', points: 50 },
    ],
  },
  speaking: {
    title: 'Speaking',
    description: 'Parlez clairement et naturellement en anglais.',
    scenarios: [
      { id: 1, prompt: 'Introduce yourself as a flight attendant and welcome passengers.', points: 60 },
      { id: 2, prompt: 'Handle a polite complaint about seat comfort.', points: 60 },
    ],
  },
  'cabin-simulation': {
    title: 'Simulation cabine',
    description: 'Simulez des interactions réalistes en cabine.',
    scenarios: [
      { id: 1, prompt: 'A passenger asks for a special meal after service ended. Respond professionally.', points: 65 },
      { id: 2, prompt: 'Make a short boarding announcement in English.', points: 65 },
    ],
  },
  passenger: {
    title: 'Passenger Mode',
    description: 'Répondez aux demandes fréquentes des passagers.',
    scenarios: [
      { id: 1, prompt: 'A passenger asks: "Could you help me find my seat?"', points: 50 },
      { id: 2, prompt: 'A passenger requests: "I need a blanket and pillow, please."', points: 50 },
      { id: 3, prompt: 'A passenger asks: "Can I have a vegetarian meal?"', points: 50 },
    ],
  },
  accent: {
    title: 'Accent Training Mode',
    description: 'Travaillez la prononciation.',
    scenarios: [
      { id: 1, prompt: 'Say the word clearly and naturally.', pronunciationWord: 'Schedule', points: 60 },
      { id: 2, prompt: 'Say the word clearly and naturally.', pronunciationWord: 'Colleague', points: 60 },
      { id: 3, prompt: 'Say the word clearly and naturally.', pronunciationWord: 'Maintenance', points: 60 },
    ],
  },
  secret: {
    title: 'Secret Challenge Mode',
    description: 'Répondez à un scénario surprise en anglais.',
    scenarios: [
      { id: 1, prompt: 'A VIP passenger lost a document. Handle the situation calmly.', points: 70 },
      { id: 2, prompt: 'You have 20 seconds to announce a gate change politely.', points: 70 },
    ],
  },
  wheel: {
    title: 'Wheel of English',
    description: 'Scénario oral aléatoire.',
    scenarios: [
      { id: 1, prompt: 'Wheel result: Delay announcement. Explain the delay in a reassuring tone.', points: 55 },
      { id: 2, prompt: 'Wheel result: Beverage service. Offer options clearly.', points: 55 },
    ],
  },
  'love-english': {
    title: 'Love & English Mode',
    description: 'Communication relation client premium.',
    scenarios: [
      { id: 1, prompt: 'Deliver warm and professional service language for a family with children.', points: 50 },
      { id: 2, prompt: 'Help an anxious passenger feel reassured before takeoff.', points: 50 },
    ],
  },
  emergency: {
    title: 'Mode Urgence',
    description: 'Entraînez-vous aux phrases de sécurité critiques.',
    scenarios: [
      { id: 1, prompt: '"Fasten your seatbelts and keep them fastened"', points: 75 },
      { id: 2, prompt: '"In case of decompression, oxygen masks will automatically drop"', points: 75 },
      { id: 3, prompt: '"Brace for impact"', points: 75 },
    ],
  },
  'company-interview': {
    title: 'Mode Interview Compagnie',
    description: 'Préparez les entretiens compagnie en anglais.',
    scenarios: [
      { id: 1, prompt: 'Answer: "Why do you want to work as cabin crew for our airline?"', points: 65 },
      { id: 2, prompt: 'Answer: "How do you handle a difficult passenger?"', points: 65 },
    ],
  },
  'lost-passenger': {
    title: 'Lost Passenger Mode',
    description: 'Aidez les voyageurs désorientés.',
    scenarios: [
      { id: 1, prompt: 'A passenger is at the wrong gate and is panicking. Assist in English.', points: 55 },
      { id: 2, prompt: 'A non-native passenger cannot find baggage claim. Give clear directions.', points: 55 },
    ],
  },
};

export default function LearnModePage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const mode = params.mode as string;
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [oralScore, setOralScore] = useState<number | null>(null);
  const [oralFeedback, setOralFeedback] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recognitionRef = useRef<any>(null);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const exercise = exerciseContent[mode];
  const totalScenarios = exercise?.scenarios.length ?? 0;
  const storageKey = `learn-mode-progress:${mode}`;

  useEffect(() => {
    if (typeof window === 'undefined' || !exercise || totalScenarios <= 0) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { currentScenarioIndex?: number };
      if (typeof parsed.currentScenarioIndex === 'number') {
        setCurrentScenarioIndex(Math.max(0, Math.min(totalScenarios - 1, parsed.currentScenarioIndex)));
      }
    } catch {
      // Ignore malformed local value.
    }
  }, [exercise, totalScenarios, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !exercise) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ currentScenarioIndex }));
  }, [currentScenarioIndex, exercise, storageKey]);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Exercice introuvable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Ce mode n&apos;est pas disponible.</p>
            <Button asChild className="w-full">
              <Link href="/learn">Retour aux exercices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scenario = exercise.scenarios[currentScenarioIndex];
  const progress = ((currentScenarioIndex + 1) / totalScenarios) * 100;

  const expectedPhrase = scenario.pronunciationWord || extractExpectedPhrase(scenario.prompt);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mediaRecorder = new MediaRecorder(stream);
      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setTranscript('');
      setOralScore(null);
      setOralFeedback('');

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
      };

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
          const value = event?.results?.[0]?.[0]?.transcript || '';
          setTranscript(value);
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
        setRecognitionSupported(false);
      }

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Enregistrement démarré. Répondez en anglais.');
    } catch (error) {
      toast.error("Impossible d'accéder au microphone.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current?.stop?.();
    setIsRecording(false);
    if (!transcript) {
      const result = computeOralScore('', expectedPhrase);
      setOralScore(result.score);
      setOralFeedback('Aucune transcription détectée, réessayez pour une meilleure évaluation.');
    }
  };

  const handleSubmit = async () => {
    if (oralScore === null) {
      toast.error("Enregistrez d'abord une réponse orale.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/exercises/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: `${mode}_${scenario.id}`,
          points: scenario.points,
          mode,
          title: exercise.title,
          content: scenario.prompt,
          transcript,
          expectedPhrase,
          oralScore,
          oralFeedback,
        }),
      });

      if (!response.ok) throw new Error('Échec de la soumission');

      toast.success(`Réponse validée: +${scenario.points} points Kiki`);

      if (currentScenarioIndex < totalScenarios - 1) {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
        setIsRecording(false);
        setAudioUrl(null);
        setTranscript('');
        setOralScore(null);
        setOralFeedback('');
      } else {
        toast.success('Exercice terminé.');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      toast.error('Impossible de soumettre cet exercice');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto justify-start">
            <Link href="/learn" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left break-words">{exercise.title}</h1>
          <div className="w-full sm:w-20 text-left sm:text-right text-sm text-muted-foreground">
            {currentScenarioIndex + 1}/{totalScenarios}
          </div>
        </div>
      </div>

      <div className="page-container-md py-8">
        <div className="mb-8">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Scénario {currentScenarioIndex + 1} sur {totalScenarios}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{exercise.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{exercise.description}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <p className="text-lg font-semibold">Prompt (EN):</p>
              <p className="text-base sm:text-lg break-words">{scenario.prompt}</p>
              {scenario.pronunciationWord && (
                <div>
                  <p className="text-lg font-semibold mt-4 mb-2">Word:</p>
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-4 break-words">{scenario.pronunciationWord}</div>
                  <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                    <Volume2 className="w-5 h-5" />
                    Écouter la prononciation
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="font-semibold">Votre réponse (à l&apos;oral)</p>
              <div
                className={`p-4 sm:p-8 rounded-lg border-2 flex items-center justify-center ${
                  isRecording
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-dashed border-muted-foreground/30 bg-muted'
                }`}
              >
                {isRecording ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Enregistrement en cours...</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Cliquez pour démarrer l&apos;enregistrement</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? 'destructive' : 'outline'} size="lg" className="w-full sm:flex-1">
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                </Button>
                <Button onClick={handleSubmit} disabled={oralScore === null || isSubmitting} size="lg" className="w-full sm:flex-1">
                  {isSubmitting ? 'Soumission...' : `Valider (+${scenario.points} pts)`}
                </Button>
              </div>

              {!recognitionSupported && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                  Transcription automatique non disponible sur ce navigateur.
                </div>
              )}

              {audioUrl && (
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                </audio>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold">Phrase attendue</p>
                <p className="text-sm text-muted-foreground break-words">{expectedPhrase}</p>
                <p className="text-sm font-semibold">Transcription détectée</p>
                <p className="text-sm text-muted-foreground break-words">{transcript || 'Aucune transcription pour le moment.'}</p>
                {oralScore !== null && (
                  <div className="p-3 rounded-lg bg-primary/10 text-sm">
                    <p className="font-semibold">Score oral: {oralScore}/100</p>
                    <p>{oralFeedback}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p>
                <strong>{scenario.points} points Kiki</strong> seront crédités après validation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function extractExpectedPhrase(prompt: string) {
  const quoted = prompt.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];
  return prompt;
}

