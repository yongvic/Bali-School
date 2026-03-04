'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboarding?: {
    englishLevel: string;
    professionGoal: string;
    airportCode?: string;
    airportName?: string;
  };
  stats: {
    exercisesCompleted: number;
    videosSubmitted: number;
    videosApproved: number;
    totalPoints: number;
  };
}

export default function AdminStudentDetailPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const studentId = params.id as string;
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetail | null>(null);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session?.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  useEffect(() => {
    const fetchStudent = async () => {
      const response = await fetch(`/api/admin/students/${studentId}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setStudent(data);
    };

    fetchStudent();
  }, [studentId]);

  if (!student) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-400">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <Button variant="outline" onClick={() => router.back()} className="text-sm font-medium">
          ← Retour à l&apos;admin
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Détail élève</p>
          <h1 className="text-3xl font-semibold text-white">{student.name}</h1>
          <p className="text-sm text-slate-400">{student.email}</p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            <p>
              <span className="font-semibold text-white">Niveau anglais :</span>{' '}
              {student.onboarding?.englishLevel || 'Non renseigné'}
            </p>
            <p>
              <span className="font-semibold text-white">Objectif pro :</span>{' '}
              {student.onboarding?.professionGoal || 'Non renseigné'}
            </p>
            <p>
              <span className="font-semibold text-white">Aéroport :</span>{' '}
              {student.onboarding?.airportName || student.onboarding?.airportCode || 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-white">Inscrit le :</span>{' '}
              {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Exercices</p>
              <p className="text-2xl font-semibold text-white">{student.stats.exercisesCompleted}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vidéos soumises</p>
              <p className="text-2xl font-semibold text-white">{student.stats.videosSubmitted}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vidéos approuvées</p>
              <p className="text-2xl font-semibold text-white">{student.stats.videosApproved}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Points Kiki</p>
              <p className="text-2xl font-semibold text-white">{student.stats.totalPoints}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-slate-800 bg-slate-900/40">
        <CardContent className="space-y-3 text-sm text-slate-400">
          <p className="text-sm text-white font-semibold">Actions rapides</p>
          <p>Passez en revue les vidéos, fournissez des commentaires et ajustez les points depuis le dashboard principal.</p>
        </CardContent>
      </Card>
    </div>
  );
}
