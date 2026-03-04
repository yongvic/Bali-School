'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Gift } from 'lucide-react';

interface Wish {
  id: string;
  title: string;
  description?: string;
  category: string;
  votes: number;
  status: string;
  createdAt: string;
}

interface WishesPayload {
  wishes: Wish[];
  canCreateWish: boolean;
  weeklyPoints: number;
  weeklyObjective: number;
  remainingToUnlock: number;
}

export default function WishesPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [eligibility, setEligibility] = useState<WishesPayload | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Exercise');
  const [description, setDescription] = useState('');

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const fetchWishes = async () => {
    const response = await fetch('/api/wishes');
    if (!response.ok) return;
    const data: WishesPayload = await response.json();
    setEligibility(data);
    setWishes(data.wishes);
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const createWish = async () => {
    const response = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, description }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.message || 'Impossible de créer le souhait');
      return;
    }

    setTitle('');
    setDescription('');
    toast.success('Souhait ajouté');
    fetchWishes();
  };

  const voteWish = async (id: string) => {
    const response = await fetch(`/api/wishes/${id}/vote`, { method: 'POST' });
    if (!response.ok) {
      toast.error('Vote impossible');
      return;
    }
    fetchWishes();
  };

  const weeklyProgress = eligibility
    ? Math.min(100, Math.round((eligibility.weeklyPoints / Math.max(eligibility.weeklyObjective, 1)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => window.history.back()}>Retour</Button>
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Boîte à idées</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proposer un souhait</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eligibility && (
              <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                <p className="text-sm font-semibold">Objectif hebdomadaire</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${weeklyProgress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {eligibility.weeklyPoints}/{eligibility.weeklyObjective} points
                  {eligibility.canCreateWish
                    ? ' - Objectif atteint, souhaits débloqués.'
                    : ` - Il reste ${eligibility.remainingToUnlock} points pour débloquer les souhaits.`}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nouveau scénario cabine" />
            </div>
            <div className="space-y-1">
              <Label>Catégorie</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Exercise" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
                rows={3}
              />
            </div>
            <Button onClick={createWish} disabled={!eligibility?.canCreateWish}>Soumettre</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes souhaits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wishes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun souhait pour le moment.</p>
            ) : (
              wishes.map((wish) => (
                <div key={wish.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{wish.title}</p>
                      <p className="text-sm text-muted-foreground">{wish.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{wish.category} · {wish.status}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => voteWish(wish.id)}>
                      Voter ({wish.votes})
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

