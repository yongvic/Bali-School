'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseCard } from '@/components/learning/ExerciseCard';
import { toast } from 'sonner';
import { ProgressBar } from '@/components/learning/ProgressBar';

interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  targetPoints: number;
  exercises: {
    id: string;
    mode: string;
    title: string;
    description: string;
    pointsValue: number;
    completed: boolean;
  }[];
}

export default function ModulePage() {
  const { data: session } = useSession();
  const params = useParams();
  const moduleId = params.id as string;

  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weekProgress, setWeekProgress] = useState(0);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch module');
        }
        const data = await response.json();
        setModule(data);

        // Calculate progress
        const completedCount = data.exercises.filter((e: any) => e.completed).length;
        const progress = (completedCount / data.exercises.length) * 100;
        setWeekProgress(progress);
      } catch (error) {
        toast.error('Failed to load module');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Loading Module...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <CardTitle>Module Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const completedCount = module.exercises.filter(e => e.completed).length;
  const earnedPoints = completedCount * 50; // Assuming 50 points per exercise

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            ← Back to Plan
          </Button>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Week {module.week}</h1>
              <p className="text-lg text-muted-foreground">{module.title}</p>
            </div>

            {module.description && (
              <p className="text-muted-foreground">{module.description}</p>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Week Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar progress={weekProgress} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Exercises Completed</p>
                <p className="text-2xl font-bold">
                  {completedCount}/{module.exercises.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kiki Points Earned</p>
                <p className="text-2xl font-bold text-primary">
                  {earnedPoints}/{module.targetPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercises Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {module.exercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                id={exercise.id}
                moduleId={moduleId}
                mode={exercise.mode}
                title={exercise.title}
                description={exercise.description}
                pointsValue={exercise.pointsValue}
                completed={exercise.completed}
              />
            ))}
          </div>
        </div>

        {/* Motivational Section */}
        {weekProgress === 100 && (
          <Card className="mt-8 border-2 border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎉</span> Week Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Excellent work! You've completed all exercises for this week. 
                Move on to Week {module.week + 1} to continue your learning journey.
              </p>
              <Button className="w-full gap-2">
                <span>Next Week</span> →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
