'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Headphones,
  Mic,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseStructuredContent, type ModuleBlueprint, type StructuredExercise } from '@/lib/learning-content';

interface ModuleExercise {
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
}

interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  targetPoints: number;
  exercises: ModuleExercise[];
}

interface PracticeStep {
  id: string;
  title: string;
  instruction: string;
  example: string;
  feedback: string;
  matcher: (exercise: ModuleExercise, structured: StructuredExercise | null) => boolean;
}

const phaseLabels = [
  'Immersion',
  'Vocabulaire structure',
  'Grammaire contextualisee',
  'Pratique guidee',
  'Production orale',
  'Evaluation finale',
];

const skillPills = [
  { label: 'Listening', icon: Headphones },
  { label: 'Speaking', icon: Mic },
  { label: 'Grammar', icon: GraduationCap },
  { label: 'Vocabulary', icon: BookOpen },
];

const practiceSteps: PracticeStep[] = [
  {
    id: 'match_pairs',
    title: '1. Match pairs (vocabulaire)',
    instruction: 'Associez chaque terme cabine a sa traduction correcte.',
    example: 'boarding pass -> carte d\'embarquement',
    feedback: 'Le bon feedback explique pourquoi le mot est adequat en contexte service passager.',
    matcher: (_exercise, structured) => structured?.kind === 'match_pairs',
  },
  {
    id: 'fill_blank',
    title: '2. Fill blank (grammaire)',
    instruction: 'Completez avec le verbe ou modal le plus poli pour une demande cabine.',
    example: 'Could you ____ your seat belt, please?',
    feedback: 'Le feedback doit rappeler la structure modal + sujet + verbe + please.',
    matcher: (_exercise, structured) => structured?.kind === 'fill_blank',
  },
  {
    id: 'sentence_order',
    title: '3. Sentence order',
    instruction: 'Remettez les segments dans l\'ordre naturel d\'une requete professionnelle.',
    example: 'could you / remain seated / please',
    feedback: 'Le feedback valide l\'ordre grammatical et l\'intonation polie attendue.',
    matcher: (_exercise, structured) => structured?.kind === 'sentence_order',
  },
  {
    id: 'qcm_situational',
    title: '4. QCM situationnel',
    instruction: 'Choisissez la meilleure formulation selon la situation cabine decrite.',
    example: 'Passenger standing during takeoff -> "Could you please take your seat?"',
    feedback: 'Le feedback compare les options et justifie pourquoi une formule est plus professionnelle.',
    matcher: (exercise, structured) => structured?.kind === 'qcm' && exercise.skill === 'READING',
  },
  {
    id: 'reading',
    title: '5. Comprehension ecrite',
    instruction: 'Lisez un mini-message cabine et reperez l\'information essentielle.',
    example: 'What does the passenger request?',
    feedback: 'Le feedback pointe le detail cle et la strategie de lecture utile.',
    matcher: (exercise, structured) =>
      structured?.kind === 'qcm' &&
      (exercise.description.toLowerCase().includes('read') || exercise.title.toLowerCase().includes('read')),
  },
  {
    id: 'listening',
    title: '6. Comprehension orale',
    instruction: 'Ecoutez puis identifiez la demande du passager avec precision.',
    example: 'Identify the request: water with ice.',
    feedback: 'Le feedback doit expliciter les indices entendus dans le dialogue.',
    matcher: (_exercise, structured) => structured?.kind === 'audio_to_word' || structured?.exerciseType === 'listening',
  },
  {
    id: 'translation',
    title: '7. Traduction courte',
    instruction: 'Traduisez une phrase cabine en anglais poli et naturel.',
    example: 'Veuillez patienter quelques minutes. -> Please wait a few minutes.',
    feedback: 'Le feedback corrige le registre de politesse et les collocations professionnelles.',
    matcher: (exercise, structured) =>
      structured?.exerciseType === 'writing' ||
      structured?.skill === 'WRITING' ||
      /translate|tradu/i.test(exercise.title + exercise.description),
  },
];

function extractStructuredExercise(content?: string): StructuredExercise | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed?.currentExercise) {
      return parsed.currentExercise as StructuredExercise;
    }
  } catch {
    // continue with parser fallback
  }

  const blueprint = parseStructuredContent(content);
  if (blueprint?.exercises?.length) return blueprint.exercises[0] ?? null;
  return null;
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
  const [activePhase, setActivePhase] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${moduleId}`);
        if (response.status === 423) {
          const data = await response.json();
          toast.error(data.message || 'Module bloque');
          redirect('/learning-plan');
        }

        if (!response.ok) {
          throw new Error('Echec de recuperation du module');
        }

        const data = await response.json();
        setModule(data);

        const firstBlueprint = data.exercises
          .map((exercise: { content?: string }) => parseStructuredContent(exercise.content || ''))
          .find(Boolean) as ModuleBlueprint | undefined;
        setBlueprint(firstBlueprint || null);

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

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      toast.error('Synthese vocale non disponible sur ce navigateur.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const structuredByExercise = useMemo(() => {
    if (!module) return new Map<string, StructuredExercise | null>();
    return new Map(module.exercises.map((exercise) => [exercise.id, extractStructuredExercise(exercise.content)]));
  }, [module]);

  const practiceExercises = useMemo(() => {
    if (!module) return [];

    const candidates = module.exercises.filter((exercise) => {
      const phase = exercise.phase || '';
      return phase === 'PRACTICE_CONTROLLED' || phase === 'PRACTICE_SEMI_GUIDED';
    });

    const used = new Set<string>();
    return practiceSteps.map((step) => {
      const found = candidates.find((exercise) => {
        if (used.has(exercise.id)) return false;
        const structured = structuredByExercise.get(exercise.id) || null;
        return step.matcher(exercise, structured);
      });

      if (found) used.add(found.id);
      return { step, exercise: found || null };
    });
  }, [module, structuredByExercise]);

  const oralExercise = useMemo(() => {
    if (!module) return null;
    return module.exercises.find((exercise) => exercise.phase === 'ORAL_PRODUCTION') || null;
  }, [module]);

  const finalExercises = useMemo(() => {
    if (!module) return [];
    return module.exercises.filter((exercise) => exercise.phase === 'FINAL_EVALUATION');
  }, [module]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Chargement du module...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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

  const completedCount = module.exercises.filter((exercise) => exercise.completed).length;
  const earnedPoints = module.exercises.filter((exercise) => exercise.completed).reduce((sum, exercise) => sum + exercise.pointsValue, 0);
  const objective = blueprint?.introduction.objective || 'A la fin de ce module, vous serez capable de formuler des demandes polies aux passagers.';
  const moduleTitle = module.title?.trim() || 'Cabin Communication Module';
  const displayTitle = moduleTitle.includes(' - ') ? moduleTitle : `Passenger Service - ${moduleTitle}`;
  const selectedWord = blueprint?.vocabulary?.[selectedWordIndex] || blueprint?.vocabulary?.[0] || null;
  const guidedProgress = Math.round(((activePhase + 1) / phaseLabels.length) * 100);
  const currentPractice = practiceExercises[practiceIndex] || null;

  const completedSkillSummary = module.exercises.reduce(
    (acc, exercise) => {
      if (exercise.completed) {
        acc.total += 1;
        acc[exercise.skill] = (acc[exercise.skill] || 0) + 1;
      }
      return acc;
    },
    { total: 0, READING: 0, LISTENING: 0, WRITING: 0, SPEAKING: 0 } as Record<string, number>
  );

  return (
    <div className="page-shell py-8">
      <div className="page-container section-stack">
        <section className="space-y-5">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour au plan
          </Button>

          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="text-2xl sm:text-3xl break-words">{displayTitle}</CardTitle>
                  <p className="text-muted-foreground mt-1">{module.title}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <ShieldCheck className="h-4 w-4" /> Niveau {blueprint?.cefrLevel || 'A1'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillPills.map(({ label, icon: Icon }) => (
                  <span key={label} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Objectif du module</p>
                <p className="text-sm text-slate-700">{objective}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progression module</span>
                  <span>{Math.round(weekProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${weekProgress}%` }} />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{completedCount}/{module.exercises.length} activites validees</span>
                  <span>{earnedPoints} / {module.targetPoints} points</span>
                  <span><Clock3 className="inline h-3.5 w-3.5" /> ~{Math.max(12, Math.ceil(module.targetPoints / 25))} min</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
            <p className="font-semibold">Parcours pedagogique guide</p>
            <p className="text-muted-foreground">Etape {activePhase + 1} / {phaseLabels.length}</p>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${guidedProgress}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {phaseLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActivePhase(index)}
                className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                  index === activePhase
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 bg-white text-muted-foreground'
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>
        </section>

        {activePhase === 0 && (
          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Phase 1 - Immersion (2-3 minutes)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold">Mini-scenario</p>
                <p className="text-sm text-amber-900 mt-1">Vous etes membre d'equipage. Un passager se leve pendant le decollage.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">Dialogue d'observation</p>
                  <Button size="sm" variant="outline" onClick={() => speak(blueprint?.listening.dialogue || '')} className="gap-2 w-full sm:w-auto">
                    <Volume2 className="h-4 w-4" /> Ecouter l'audio
                  </Button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {blueprint?.listening.dialogue || 'Crew: Could you please take your seat? Passenger: Sorry, I need my bag. Crew: Thank you, we can help after takeoff.'}
                </p>
                <p className="text-xs text-muted-foreground">Objectif: comprendre la situation avant d'apprendre les structures.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activePhase === 1 && (
          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Phase 2 - Vocabulaire structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Chaque mot est cliquable avec traduction, audio et exemple d'utilisation cabine.</p>
              <div className="grid gap-3 md:grid-cols-3">
                {(blueprint?.vocabulary || []).map((item, index) => (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => setSelectedWordIndex(index)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      selectedWord?.word === item.word
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-semibold">{item.word}</p>
                    <p className="text-xs text-muted-foreground">{item.translation}</p>
                  </button>
                ))}
              </div>

              {selectedWord && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-semibold">{selectedWord.word}</p>
                    <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => speak(selectedWord.audioText)}>
                      <AudioLines className="h-4 w-4" /> Audio
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Traduction: {selectedWord.translation}</p>
                  <p className="text-sm">Exemple: {selectedWord.example}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activePhase === 2 && (
          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Phase 3 - Grammaire contextualisee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <p className="font-semibold">Polite Requests in Professional Context</p>
                <p className="text-sm text-muted-foreground">In passenger service, we use modal verbs to sound polite.</p>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-white p-3"><strong>Can</strong> = neutral</div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3"><strong>Could</strong> = more polite</div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3"><strong>Would</strong> = offer</div>
                </div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {(blueprint?.grammar.examples || [
                    'Could you fasten your seat belt, please?',
                    'Would you like water or juice?',
                  ]).map((example) => (
                    <li key={example}>- {example}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Mini-exercice immediat</p>
                <p className="text-sm font-medium">{blueprint?.grammar.miniExercise || 'Rewrite: "Sit down now." politely.'}</p>
                <p className="text-xs text-muted-foreground">Exemple attendu: "Could you please take your seat?"</p>
                <p className="text-xs text-slate-600">Feedback pedagogique: la demande est claire, polie et reste orientee securite.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activePhase === 3 && (
          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Phase 4 - Pratique guidee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Progression imposee du simple au complexe. L'oral n'apparait pas dans cette phase.</p>

              {currentPractice && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Exercice {practiceIndex + 1} / {practiceExercises.length}</p>
                  <p className="text-lg font-semibold">{currentPractice.step.title}</p>
                  <p className="text-sm"><strong>Consigne:</strong> {currentPractice.step.instruction}</p>
                  <p className="text-sm text-muted-foreground"><strong>Exemple:</strong> {currentPractice.step.example}</p>
                  <p className="text-sm text-slate-700"><strong>Feedback pedagogique attendu:</strong> {currentPractice.step.feedback}</p>

                  {currentPractice.exercise ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Activite reliee: {currentPractice.exercise.title}</p>
                        <p className="text-xs text-muted-foreground break-words">{currentPractice.exercise.description}</p>
                      </div>
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/learning/exercise/${currentPractice.exercise.id}`}>Commencer</Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 rounded-xl border border-amber-300 bg-amber-50 p-3">
                      Aucun exercice associe trouve pour cette etape dans ce module.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setPracticeIndex((prev) => Math.max(0, prev - 1))}
                  disabled={practiceIndex === 0}
                  className="w-full sm:w-auto"
                >
                  Etape precedente
                </Button>
                <Button
                  onClick={() => setPracticeIndex((prev) => Math.min(practiceExercises.length - 1, prev + 1))}
                  disabled={practiceIndex >= practiceExercises.length - 1}
                  className="w-full sm:w-auto"
                >
                  Etape suivante
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activePhase === 4 && (
          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Phase 5 - Speaking Practice - Cabin Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Contexte: A passenger refuses to sit down during takeoff.</p>
              <p className="text-sm"><strong>Instruction:</strong> Record a polite request using "could" or "would".</p>

              <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-2 text-sm">
                <p>1. Bouton activer micro.</p>
                <p>2. Indicateur d'enregistrement visible pendant la prise.</p>
                <p>3. Transcription affichee apres arret.</p>
                <p>4. Comparaison avec la structure attendue.</p>
                <p>5. Score + feedback de politesse et de clarte.</p>
              </div>

              {oralExercise ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold">Exercice oral final: {oralExercise.title}</p>
                    <p className="text-xs text-muted-foreground break-words">{oralExercise.description}</p>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/learning/exercise/${oralExercise.id}`}>Activer le micro</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-amber-700 rounded-xl border border-amber-300 bg-amber-50 p-3">Aucun exercice oral final n'est configure.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activePhase === 5 && (
          <Card className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle>Phase 6 - Evaluation finale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                <p><strong>Mini-test (3 questions):</strong></p>
                <p>1. Choisissez la formulation la plus polie pour une demande passager.</p>
                <p>2. Identifiez le modal le plus adapte au contexte professionnel.</p>
                <p>3. Selectionnez la reponse qui combine courtoisie et securite.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-muted-foreground">Score global</p>
                  <p className="text-2xl font-bold">{Math.round(weekProgress)}%</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-muted-foreground">Competences validees</p>
                  <p className="font-semibold">R {completedSkillSummary.READING} - L {completedSkillSummary.LISTENING} - W {completedSkillSummary.WRITING} - S {completedSkillSummary.SPEAKING}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-muted-foreground">Decision</p>
                  <p className="font-semibold">{weekProgress >= 80 ? 'Validation du module' : 'Reprise conseillee des etapes 2 a 4'}</p>
                </div>
              </div>

              {finalExercises.length > 0 && (
                <div className="space-y-2">
                  {finalExercises.slice(0, 3).map((exercise, index) => (
                    <div key={exercise.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Question {index + 1}: {exercise.title}</p>
                        <p className="text-xs text-muted-foreground break-words">{exercise.description}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                        <Link href={`/learning/exercise/${exercise.id}`}>Repondre</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Resume des competences disponible sur cette page.</p>
                <Button variant="outline" asChild>
                  <Link href="/learning-plan">Retour au plan d'apprentissage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => setActivePhase((prev) => Math.max(0, prev - 1))} disabled={activePhase === 0} className="w-full sm:w-auto">
            Phase precedente
          </Button>
          <Button onClick={() => setActivePhase((prev) => Math.min(phaseLabels.length - 1, prev + 1))} disabled={activePhase === phaseLabels.length - 1} className="gap-2 w-full sm:w-auto">
            Etape suivante <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
