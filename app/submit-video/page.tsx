'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { VideoUploadSection } from '@/components/learning/VideoUploadSection';

interface Exercise {
  id: string;
  title: string;
  mode: string;
}

export default function SubmitVideoPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? 'loading';
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) throw new Error('Échec du chargement des exercices');
        const data = await response.json();
        setExercises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchExercises();
    }
  }, [session?.user?.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des exercices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Soumettre une vidéo</h1>
          <p className="text-muted-foreground mt-1">Enregistrez puis envoyez votre pratique orale en anglais</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Choisissez l&apos;exercice à soumettre</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun exercice disponible</p>
              ) : (
                exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => setSelectedExercise(exercise.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedExercise === exercise.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-semibold">{exercise.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exercise.mode}</p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {selectedExercise ? (
          <div className="mt-6">
            <VideoUploadSection exerciseId={selectedExercise} onUploadSuccess={() => setSelectedExercise(null)} />
          </div>
        ) : (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Sélectionnez un exercice, puis choisissez votre méthode: allumer la caméra ou importer une vidéo depuis votre appareil.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

