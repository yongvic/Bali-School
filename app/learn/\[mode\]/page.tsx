'use client';

import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Volume2 } from 'lucide-react';
import Link from 'next/link';

const exerciseContent: Record<string, any> = {
  passenger: {
    title: 'Passenger Scenarios',
    description: 'Respond to common passenger requests',
    scenarios: [
      {
        id: 1,
        passenger: 'A passenger asks: "Could you help me find my seat?"',
        points: 50,
      },
      {
        id: 2,
        passenger: 'A passenger requests: "I need a blanket and pillow, please."',
        points: 50,
      },
      {
        id: 3,
        passenger: 'A passenger asks: "Can I have a vegetarian meal?"',
        points: 50,
      },
    ],
  },
  accent: {
    title: 'Accent Training',
    description: 'Master English pronunciation',
    scenarios: [
      {
        id: 1,
        word: 'Schedule',
        points: 60,
      },
      {
        id: 2,
        word: 'Colleague',
        points: 60,
      },
      {
        id: 3,
        word: 'Maintenance',
        points: 60,
      },
    ],
  },
  emergency: {
    title: 'Emergency Procedures',
    description: 'Practice critical safety phrases',
    scenarios: [
      {
        id: 1,
        phrase: '"Fasten your seatbelts and keep them fastened"',
        points: 75,
      },
      {
        id: 2,
        phrase: '"In case of decompression, oxygen masks will automatically drop"',
        points: 75,
      },
      {
        id: 3,
        phrase: '"Brace for impact"',
        points: 75,
      },
    ],
  },
};

export default function LearnModePage() {
  const { data: session } = useSession();
  const params = useParams();
  const mode = params.mode as string;
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const exercise = exerciseContent[mode];
  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Exercise Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This exercise mode is not available.
            </p>
            <Button asChild className="w-full">
              <Link href="/learn">Back to Exercises</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scenario = exercise.scenarios[currentScenarioIndex];
  const totalScenarios = exercise.scenarios.length;
  const progress = ((currentScenarioIndex + 1) / totalScenarios) * 100;

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success('Recording started... Speak your answer!');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate submission and points award
      const response = await fetch('/api/exercises/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: mode + '_' + scenario.id,
          points: scenario.points,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit exercise');

      toast.success(`Great! You earned ${scenario.points} Kiki Points!`);

      if (currentScenarioIndex < totalScenarios - 1) {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
        setIsRecording(false);
      } else {
        toast.success('Exercise completed! All scenarios finished!');
        setTimeout(() => {
          redirect('/learn');
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to submit exercise');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/learn" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-bold">{exercise.title}</h1>
          <div className="w-20 text-right text-sm text-muted-foreground">
            {currentScenarioIndex + 1}/{totalScenarios}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Scenario {currentScenarioIndex + 1} of {totalScenarios}
          </p>
        </div>

        {/* Scenario Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{exercise.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Scenario Content */}
            <div className="bg-muted p-6 rounded-lg space-y-4">
              {scenario.passenger && (
                <>
                  <p className="text-lg font-semibold">Passenger:</p>
                  <p className="text-xl">{scenario.passenger}</p>
                </>
              )}
              {scenario.word && (
                <>
                  <p className="text-lg font-semibold">Pronunciation Practice:</p>
                  <div className="text-4xl font-bold text-primary mb-4">
                    {scenario.word}
                  </div>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Volume2 className="w-5 h-5" />
                    Listen to Correct Pronunciation
                  </Button>
                </>
              )}
              {scenario.phrase && (
                <>
                  <p className="text-lg font-semibold">Emergency Phrase:</p>
                  <p className="text-xl italic">{scenario.phrase}</p>
                </>
              )}
            </div>

            {/* Recording Section */}
            <div className="space-y-4">
              <p className="font-semibold">Your Response:</p>
              <div className={`p-8 rounded-lg border-2 flex items-center justify-center ${
                isRecording
                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                  : 'border-dashed border-muted-foreground/30 bg-muted'
              }`}>
                {isRecording ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Recording...</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Click to start recording</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRecordToggle}
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="lg"
                  className="flex-1"
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isRecording || isSubmitting}
                  size="lg"
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : `Submit (+${scenario.points} pts)`}
                </Button>
              </div>
            </div>

            {/* Points Info */}
            <div className="bg-primary/10 p-4 rounded-lg text-sm">
              <p>
                <strong>Earn {scenario.points} Kiki Points</strong> when you submit this response
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
