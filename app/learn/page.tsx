'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const exerciseModes = [
  {
    id: 'passenger',
    name: 'Passenger Scenarios',
    description: 'Respond to common passenger requests in English',
    icon: '👥',
    pointsPerExercise: 50,
  },
  {
    id: 'accent',
    name: 'Accent Training',
    description: 'Focus on pronunciation and accent neutralization',
    icon: '🎤',
    pointsPerExercise: 60,
  },
  {
    id: 'emergency',
    name: 'Emergency Procedures',
    description: 'Practice critical safety phrases and procedures',
    icon: '⚠️',
    pointsPerExercise: 75,
  },
  {
    id: 'role_play',
    name: 'Role Play Dialogue',
    description: 'Interactive dialogue practice with AI instructor',
    icon: '🎭',
    pointsPerExercise: 55,
  },
  {
    id: 'listening',
    name: 'Listening Comprehension',
    description: 'Understand English in various accents and speeds',
    icon: '👂',
    pointsPerExercise: 45,
  },
  {
    id: 'wheel',
    name: 'Wheel of English',
    description: 'Random scenario spinner - never know what you\'ll get',
    icon: '🎡',
    pointsPerExercise: 50,
  },
];

export default function LearnPage() {
  const { data: session } = useSession();
  const { data: modules } = useSWR(
    session?.user?.id ? `/api/learning/modules` : null,
    fetcher
  );

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Learning Center</h1>
          <p className="text-muted-foreground mt-2">Choose an exercise mode and start earning Kiki Points</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* This Week's Focus */}
        {modules?.weeklyFocus && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">This Week's Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold">{modules.weeklyFocus}</p>
              <p className="text-sm text-muted-foreground mt-2">Aim to complete at least 300 Kiki Points this week</p>
            </CardContent>
          </Card>
        )}

        {/* Exercise Modes Grid */}
        <h2 className="text-2xl font-bold mb-6">Choose Your Exercise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exerciseModes.map((mode) => (
            <Card key={mode.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <div className="text-4xl mb-2">{mode.icon}</div>
                <CardTitle>{mode.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Points per exercise:</span>
                    <span className="font-bold text-primary">{mode.pointsPerExercise} pts</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/learn/${mode.id}`}>
                      Start Exercise
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle>How to Earn Maximum Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Complete exercises daily for consistency bonus</p>
            <p>✓ Submit videos for instructor feedback (additional points)</p>
            <p>✓ Achieve 300+ points weekly to maintain streak</p>
            <p>✓ Unlock badges to boost motivation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
