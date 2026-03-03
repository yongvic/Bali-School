'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoUploadSection } from '@/components/learning/VideoUploadSection';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  mode: string;
  title: string;
  description: string;
  content: string;
  pointsValue: number;
  completed: boolean;
}

const exerciseModeGuides: Record<string, { title: string; instructions: string[] }> = {
  PASSENGER: {
    title: 'Passenger Service',
    instructions: [
      'Watch the scenario: A passenger requests a beverage',
      'Record yourself responding professionally',
      'Use proper airline terminology',
      'Maintain a friendly and professional tone',
    ],
  },
  ACCENT_TRAINING: {
    title: 'Accent Training',
    instructions: [
      'Listen to the English phrase pronunciation',
      'Record yourself saying the phrase',
      'Focus on correct pronunciation',
      'Match the native speaker accent',
    ],
  },
  SECRET_CHALLENGE: {
    title: 'Secret Challenge',
    instructions: [
      'You will get a random scenario',
      'Respond naturally and authentically',
      'Handle unexpected situations with grace',
      'Show your best communication skills',
    ],
  },
  WHEEL_OF_ENGLISH: {
    title: 'Wheel of English',
    instructions: [
      'Spin the wheel to get a random topic',
      'Speak about that topic for 1-2 minutes',
      'Use aviation industry vocabulary',
      'Practice spontaneous speaking',
    ],
  },
  ROLE_PLAY: {
    title: 'Role Play',
    instructions: [
      'Read the scenario description',
      'Play your assigned role convincingly',
      'Interact with the given dialogue',
      'Maintain character throughout',
    ],
  },
  LISTENING: {
    title: 'Listening Comprehension',
    instructions: [
      'Listen to the audio carefully',
      'Answer comprehension questions',
      'Type or speak your answers',
      'Focus on detail and understanding',
    ],
  },
  EMERGENCY: {
    title: 'Emergency Procedures',
    instructions: [
      'Learn critical emergency phrases',
      'Practice clear pronunciation',
      'Record yourself saying each phrase',
      'Ensure clarity and accuracy',
    ],
  },
  CUSTOM: {
    title: 'Custom Exercise',
    instructions: [
      'Follow the provided prompt',
      'Record your response or answer',
      'Be creative and thorough',
      'Show your understanding',
    ],
  },
};

export default function ExercisePage() {
  const { data: session } = useSession();
  const params = useParams();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercises/${exerciseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch exercise');
        }
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        toast.error('Failed to load exercise');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to access camera/microphone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handleSubmit = async () => {
    if (!recordedBlob) {
      toast.error('Please record a video first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', recordedBlob, `exercise-${exerciseId}.webm`);
      formData.append('exerciseId', exerciseId);

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const data = await response.json();
      toast.success('Video submitted for review!');

      // Reset recording
      setRecordedBlob(null);
      chunksRef.current = [];
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit video');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Loading Exercise...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Exercise Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const modeGuide = exerciseModeGuides[exercise.mode] || exerciseModeGuides.CUSTOM;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            ← Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">{exercise.title}</h1>
          <p className="text-lg text-muted-foreground">{exercise.mode.replace(/_/g, ' ')}</p>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="instructions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="scenario">Scenario</TabsTrigger>
            <TabsTrigger value="record">Record & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{modeGuide.title} Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {modeGuide.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-muted-foreground pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-6">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>💡 Tip:</strong> Take your time to understand the scenario first. 
                    When you're ready, move to the Record tab to submit your response.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {exercise.content}
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>📌 Remember:</strong> This is a learning exercise. Focus on clear 
                    communication and correct pronunciation rather than perfection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="record" className="space-y-4">
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">Record Your Response</p>
              <p className="text-muted-foreground">
                {exercise.pointsValue} Kiki Points will be awarded for completion
              </p>
            </div>
            <VideoUploadSection exerciseId={exerciseId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
