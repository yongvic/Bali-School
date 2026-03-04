'use client';

import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Star,
  Plane,
  Shield,
  Crown,
  BookOpen,
  Ear,
  CircleDotDashed,
  Flame,
  Loader2,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const BADGE_DEFINITIONS = {
  FIRST_EXERCISE: { name: 'Premier exercice', icon: Target },
  PRONUNCIATION_STAR: { name: 'Star prononciation', icon: Star },
  CABIN_MASTER: { name: 'Cabin Master', icon: Plane },
  SAFETY_GURU: { name: 'Safety Guru', icon: Shield },
  CONSISTENCY_KING: { name: 'Régularité', icon: Crown },
  GRAMMAR_CHAMPION: { name: 'Grammar Champion', icon: BookOpen },
  LISTENING_LEGEND: { name: 'Listening Legend', icon: Ear },
  WHEEL_WINNER: { name: 'Wheel Winner', icon: CircleDotDashed },
  LEVEL_A1: { name: 'Badge Niveau A1', icon: Target },
  LEVEL_A2: { name: 'Badge Niveau A2', icon: BookOpen },
  LEVEL_B1: { name: 'Badge Niveau B1', icon: Star },
  LEVEL_B2: { name: 'Badge Niveau B2', icon: Shield },
  LEVEL_C1: { name: 'Badge Niveau C1', icon: Crown },
} as const;

type BadgeCode = keyof typeof BADGE_DEFINITIONS;

interface GamificationData {
  totalPoints: number;
  weeklyPoints: number;
  weeklyGoal: number;
  badges: BadgeCode[];
  unlockedBadges: BadgeCode[];
  consecutiveDays: number;
}

export default function GamificationPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const { data, isLoading } = useSWR<GamificationData>(
    session?.user?.id ? '/api/gamification' : null,
    fetcher
  );

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement de vos récompenses...</p>
        </div>
      </div>
    );
  }

  const allBadges = data.badges.map((badgeCode) => ({
    code: badgeCode,
    ...BADGE_DEFINITIONS[badgeCode],
    unlocked: data.unlockedBadges.includes(badgeCode),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Vos récompenses</h1>
          <p className="text-lg text-muted-foreground">Suivez vos points Kiki et badges débloqués</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Points totaux</p>
                  <p className="text-3xl font-bold">{data.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Flame className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-3xl font-bold">
                    {data.consecutiveDays} {data.consecutiveDays > 1 ? 'jours' : 'jour'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Star className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Badges</p>
                  <p className="text-3xl font-bold">
                    {data.unlockedBadges.length}/{data.badges.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Badges de progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.code}
                    className={`p-6 rounded-lg border-2 text-center ${
                      badge.unlocked
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 opacity-50'
                    }`}
                  >
                    <Icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{badge.name}</h3>
                    {badge.unlocked ? <Badge>Débloqué</Badge> : <Badge variant="outline">Verrouillé</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Comment gagner des points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"><span>Terminer un exercice</span><span className="font-bold text-blue-600">+50-75 pts</span></div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"><span>Soumettre une vidéo</span><span className="font-bold text-indigo-600">+20 pts</span></div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"><span>Débloquer un badge</span><span className="font-bold text-yellow-600">+100 pts</span></div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20"><span>Bonus de régularité</span><span className="font-bold text-green-600">+10 pts/jour</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

