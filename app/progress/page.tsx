'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Calendar, Target } from 'lucide-react';

interface ProgressData {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  exercisesCompleted: number;
  videosSubmitted: number;
  currentLevel: number;
  completionPercentage: number;
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/user/progress');
        if (!response.ok) throw new Error('Failed to fetch progress');
        
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchProgress();
    }
  }, [session?.user?.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="text-muted-foreground mt-1">Track your learning journey</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {progress && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{progress.totalPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-500">{progress.weeklyPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">{progress.monthlyPoints}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{progress.currentLevel}</p>
                </CardContent>
              </Card>
            </div>

            {/* Completion Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Course Completion</span>
                    <span className="text-sm text-muted-foreground">{progress.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500"
                      style={{ width: `${progress.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exercises Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{progress.exercisesCompleted}</p>
                  <p className="text-sm text-muted-foreground mt-2">Total exercises finished</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Videos Submitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{progress.videosSubmitted}</p>
                  <p className="text-sm text-muted-foreground mt-2">Videos uploaded for review</p>
                </CardContent>
              </Card>
            </div>

            {/* Learning Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-semibold text-sm mb-2">Your Strengths</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re excelling at listening comprehension and practical exercises.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-semibold text-sm mb-2">Areas to Focus On</p>
                  <p className="text-sm text-muted-foreground">
                    Consider spending more time on accent training and pronunciation drills.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
