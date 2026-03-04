'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Users,
  Mic,
  ShieldAlert,
  Theater,
  Ear,
  CircleDotDashed,
  BookOpen,
  ClipboardCheck,
  MessageSquareText,
  Headphones,
  WandSparkles,
  HeartHandshake,
  Briefcase,
  UserX,
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const exerciseModes = [
  { id: 'reading', name: 'Lecture en anglais', description: 'Lisez un texte en anglais puis répondez aux consignes.', icon: BookOpen, pointsPerExercise: 40 },
  { id: 'quiz', name: 'Quiz', description: 'Validez vos acquis avec des questions à choix multiples.', icon: ClipboardCheck, pointsPerExercise: 45 },
  { id: 'vocabulary', name: 'Vocabulaire', description: 'Travaillez le vocabulaire aéronautique clé.', icon: MessageSquareText, pointsPerExercise: 50 },
  { id: 'speaking', name: 'Speaking', description: 'Pratiquez la production orale en anglais professionnel.', icon: Headphones, pointsPerExercise: 60 },
  { id: 'cabin-simulation', name: 'Simulation cabine', description: 'Simulez des situations réalistes de service en cabine.', icon: Theater, pointsPerExercise: 65 },
  { id: 'passenger', name: 'Passenger Mode', description: 'Répondez à des demandes passagers en anglais.', icon: Users, pointsPerExercise: 50 },
  { id: 'accent', name: 'Accent Training Mode', description: 'Améliorez prononciation, rythme et clarté.', icon: Mic, pointsPerExercise: 60 },
  { id: 'secret', name: 'Secret Challenge Mode', description: 'Défi surprise avec consignes aléatoires.', icon: WandSparkles, pointsPerExercise: 70 },
  { id: 'wheel', name: 'Wheel of English', description: 'Scénario aléatoire pour tester votre réactivité.', icon: CircleDotDashed, pointsPerExercise: 55 },
  { id: 'love-english', name: 'Love & English Mode', description: 'Dialogues positifs et relation client premium.', icon: HeartHandshake, pointsPerExercise: 50 },
  { id: 'emergency', name: 'Mode Urgence', description: 'Phrases critiques de sécurité en cabine.', icon: ShieldAlert, pointsPerExercise: 75 },
  { id: 'company-interview', name: 'Mode Interview Compagnie', description: 'Préparez vos entretiens de recrutement cabine.', icon: Briefcase, pointsPerExercise: 65 },
  { id: 'lost-passenger', name: 'Lost Passenger Mode', description: 'Gérez un passager perdu ou désorienté.', icon: UserX, pointsPerExercise: 55 },
];

export default function LearnPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const { data: modules } = useSWR(session?.user?.id ? '/api/learning/modules' : null, fetcher);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="page-shell">
      <div className="border-b border-border/40">
        <div className="page-container py-6 sm:py-8">
          <h1 className="page-title">Centre d&apos;apprentissage</h1>
          <p className="page-subtitle mt-2">Choisissez un mode et commencez à gagner des points Kiki</p>
        </div>
      </div>

      <div className="page-container py-8">
        {modules?.weeklyFocus && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Objectif de la semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold">{modules.weeklyFocus}</p>
              <p className="text-sm text-muted-foreground mt-2">Objectif recommandé: 300 points Kiki minimum</p>
              {modules.recommendedModuleId && (
                <Button asChild size="sm" className="mt-3">
                  <Link href={`/learning/module/${modules.recommendedModuleId}`}>Continuer le module recommandé</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-bold mb-6">Choisir un exercice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exerciseModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card key={mode.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <Icon className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="leading-tight break-words">{mode.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground mb-4 break-words">{mode.description}</p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Points par exercice :</span>
                      <span className="font-bold text-primary">{mode.pointsPerExercise} pts</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/learn/${mode.id}`}>
                        Lancer l&apos;exercice
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle>Conseils progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Complétez des exercices chaque jour pour maintenir votre régularité.</p>
            <p>Soumettez des vidéos pour recevoir un feedback de qualité.</p>
            <p>Visez 300+ points chaque semaine.</p>
            <p>Débloquez les badges pour suivre vos jalons.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

