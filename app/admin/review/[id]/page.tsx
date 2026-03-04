'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Video } from 'lucide-react';

interface VideoReview {
  id: string;
  studentName: string;
  exerciseTitle: string;
  blobUrl: string;
  submittedAt: string;
  status: string;
}

export default function VideoReviewPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const params = useParams();
  const videoId = params.id as string;
  const router = useRouter();

  const [video, setVideo] = useState<VideoReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REVISION_NEEDED'>('APPROVED');
  const [textFeedback, setTextFeedback] = useState('');
  const [grade, setGrade] = useState('80');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/admin/videos/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const data = await response.json();
        setVideo(data);
      } catch (error) {
        toast.error('Impossible de charger la vidéo');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleSubmitFeedback = async () => {
    if (!textFeedback.trim()) {
      toast.error('Merci de saisir un feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/videos/${videoId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          textFeedback,
          grade: parseInt(grade, 10),
          strengths: strengths.split('\n').filter((s) => s.trim()),
          improvements: improvements.split('\n').filter((s) => s.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de soumission du feedback');
      }

      toast.success('Feedback envoyé');
      router.push('/admin');
    } catch (error) {
      toast.error('Impossible de soumettre le feedback');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Video className="mx-auto h-10 w-10 text-primary animate-pulse" />
          <p className="text-sm text-slate-400">Chargement de la vidéo...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-sm border-slate-800">
          <CardHeader>
            <CardTitle>Vidéo introuvable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">La vidéo a peut-être déjà été traitée.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <Button variant="outline" onClick={() => router.back()} className="text-sm font-medium">
          ← Retour au tableau
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Revue vidéo</p>
          <h1 className="text-3xl font-semibold text-white">
            {video.studentName} · {video.exerciseTitle}
          </h1>
          <p className="text-sm text-slate-400">
            Soumise le {new Date(video.submittedAt).toLocaleString()}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle>Vidéo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <video controls className="h-full w-full object-cover" src={video.blobUrl} />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="rounded-full border border-slate-700 px-3 py-1">Statut : {video.status}</span>
                <span className="rounded-full border border-slate-700 px-3 py-1">ID : {video.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="decision" className="space-y-4">
            <TabsList className="grid grid-cols-2 gap-2 bg-slate-900 px-1 rounded-lg border border-slate-800">
              <TabsTrigger value="decision">Décision</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="decision" className="space-y-4">
              <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                  <CardTitle>Décision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={decision} onValueChange={(value) => setDecision(value as typeof decision)}>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-slate-950/20 p-3">
                        <RadioGroupItem value="APPROVED" id="approved" />
                        <Label htmlFor="approved" className="flex-1">
                          <div className="flex items-center gap-2 text-green-500 font-semibold">
                            <CheckCircle className="h-4 w-4" />
                            Approuver
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Offrir des points et finaliser la revue.</p>
                        </Label>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border border-orange-500/20 bg-slate-950/20 p-3">
                        <RadioGroupItem value="REVISION_NEEDED" id="revision" />
                        <Label htmlFor="revision" className="flex-1">
                          <div className="flex items-center gap-2 text-orange-500 font-semibold">
                            <AlertCircle className="h-4 w-4" />
                            Révision demandée
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Soumettre des retours précis et laisser un nouveau passage.</p>
                        </Label>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-slate-950/20 p-3">
                        <RadioGroupItem value="REJECTED" id="rejected" />
                        <Label htmlFor="rejected" className="flex-1">
                          <div className="flex items-center gap-2 text-red-500 font-semibold">
                            <XCircle className="h-4 w-4" />
                            Refuser
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Laisser un feedback ferme pour recommencer.</p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                  <CardTitle>Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full"
                  />
                  <div className="mt-2 text-center text-2xl font-semibold text-white">
                    {grade}/100
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                  <CardTitle>Feedback texte</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="feedback" className="text-xs text-slate-400">
                    Retour principal
                  </Label>
                  <Textarea
                    id="feedback"
                    value={textFeedback}
                    onChange={(e) => setTextFeedback(e.target.value)}
                    placeholder="Énoncez clairement ce qui fonctionne et ce qu'il faut corriger."
                    rows={4}
                    className="resize-none bg-slate-950 border-slate-800"
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                  <CardTitle>Points forts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="strengths" className="text-xs text-slate-400">
                    Une ligne par point
                  </Label>
                  <Textarea
                    id="strengths"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Bonne diction&#10;Confiance affichée&#10;Structure claire"
                    rows={3}
                    className="resize-none bg-slate-950 border-slate-800"
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                  <CardTitle>Axes d'amélioration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="improvements" className="text-xs text-slate-400">
                    Indiquez les prochaines étapes
                  </Label>
                  <Textarea
                    id="improvements"
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Ralentir un peu&#10;Accentuer les voyelles&#10;Ajouter un mot de conclusion"
                    rows={3}
                    className="resize-none bg-slate-950 border-slate-800"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Button
        onClick={handleSubmitFeedback}
        disabled={isSubmitting}
        className="w-full md:w-1/2"
      >
        {isSubmitting ? 'Soumission...' : 'Soumettre le feedback'}
      </Button>
    </div>
  );
}
