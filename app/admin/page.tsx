'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Video, Users, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalStudents: number;
  pendingVideos: number;
  totalVideosReviewed: number;
  averageCompletionRate: number;
}

interface VideoSubmission {
  id: string;
  userName: string;
  exerciseTitle: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  videoUrl: string;
}

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  exercisesCompleted: number;
  videosSubmitted: number;
}

export default function AdminPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? 'loading';
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, videosRes, studentsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/videos'),
          fetch('/api/admin/students'),
        ]);

        if (!statsRes.ok || !videosRes.ok || !studentsRes.ok) {
          throw new Error('Impossible de charger les données administrateur');
        }

        const [statsData, videosData, studentsData] = await Promise.all([
          statsRes.json(),
          videosRes.json(),
          studentsRes.json(),
        ]);

        setStats(statsData);
        setVideos(videosData);
        setStudents(studentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        toast.error('Impossible de charger la page admin');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [session?.user?.role]);

  const pendingVideos = useMemo(
    () => videos.filter((video) => video.status === 'pending'),
    [videos]
  );

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const statsTiles = [
    {
      label: 'Élèves actifs',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      badge: `${students.length} inscrits`,
    },
    {
      label: 'Vidéos en attente',
      value: stats?.pendingVideos ?? pendingVideos.length,
      icon: Video,
      badge: 'À revoir',
    },
    {
      label: 'Vidéos revues',
      value: stats?.totalVideosReviewed ?? 0,
      icon: Sparkles,
      badge: 'Feedback envoyé',
    },
    {
      label: 'Progression moyenne',
      value: `${Math.round(stats?.averageCompletionRate ?? 0)}%`,
      icon: BookOpen,
      badge: 'Global',
    },
  ];

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du tableau admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Synthèse</p>
          <h2 className="text-3xl font-semibold">Tout le pilotage au même endroit</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Suivez les soumissions, donnez vos verdicts et accompagnez les élèves. La navigation à gauche vous permet
          d&apos;atteindre les sections clés en un clic.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="#pending">
            <Button size="sm">Voir les vidéos en attente</Button>
          </Link>
          <Link href="#students">
            <Button variant="outline" size="sm">
              Accéder aux élèves
            </Button>
          </Link>
          <Link href="#content">
            <Button variant="ghost" size="sm">
              Gérer le contenu
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsTiles.map((tile) => {
          const TileIcon = tile.icon;
          return (
            <Card key={tile.label} className="bg-slate-900 border-slate-800 shadow-sm">
              <CardHeader className="flex items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TileIcon className="h-4 w-4 text-primary" />
                  <span>{tile.label}</span>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{tile.badge}</span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">{tile.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section id="pending" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Vidéos</p>
            <h3 className="text-2xl font-semibold">Soumissions en attente ({pendingVideos.length})</h3>
          </div>
          <Link href="#pending">
            <Button size="sm" variant="ghost" className="gap-2">
              <Video className="h-4 w-4" />
              Actualiser
            </Button>
          </Link>
        </div>

        {pendingVideos.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Aucune vidéo à revoir pour l&apos;instant.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVideos.slice(0, 6).map((video) => (
              <Card key={video.id} className="border-slate-800 shadow-sm">
                <CardHeader>
                  <div className="text-sm text-muted-foreground">Soumise par {video.userName}</div>
                  <CardTitle className="text-lg">{video.exerciseTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Soumise le {new Date(video.submittedAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-slate-700 px-2 py-1">Status: En attente</span>
                    <span className="rounded-full border border-slate-700 px-2 py-1">Vidéo</span>
                  </div>
                  <Link href={`/admin/review/${video.id}`}>
                    <Button className="w-full">
                      <span>Revoir la vidéo</span> →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="students" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Élèves</p>
            <h3 className="text-2xl font-semibold">Suivi des apprenants</h3>
          </div>
        </div>

        <Card className="border-slate-800">
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Exercices validés</th>
                  <th className="py-3 px-4">Vidéos soumises</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-800 hover:bg-slate-900">
                    <td className="py-3 px-4 font-medium text-foreground">{student.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                    <td className="py-3 px-4">{student.exercisesCompleted}</td>
                    <td className="py-3 px-4">{student.videosSubmitted}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/students/${student.id}`}>
                        <Button variant="outline" size="sm">
                          Voir le profil
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section id="content" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contenu</p>
            <h3 className="text-2xl font-semibold">Actions de gestion</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              Ajouter un exercice
            </Button>
            <Button variant="outline" size="sm">
              Modifier modules
            </Button>
            <Button variant="outline" size="sm">
              Configurer les badges
            </Button>
          </div>
        </div>
        <Card className="border-dashed border-slate-800 bg-slate-900/60">
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Toutes ces actions ouvriront une interface dédiée une fois que les API de contenu seront disponibles.
              Pour l&apos;instant, vous pouvez utiliser les données ci-dessus pour piloter les révisions et les points.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
