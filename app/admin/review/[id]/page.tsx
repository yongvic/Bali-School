'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface VideoReview {
  id: string;
  studentName: string;
  exerciseTitle: string;
  blobUrl: string;
  submittedAt: string;
  status: string;
}

export default function VideoReviewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REVISION_NEEDED'>('APPROVED');
  const [textFeedback, setTextFeedback] = useState('');
  const [grade, setGrade] = useState('80');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [recordingAudio, setRecordingAudio] = useState(false);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
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
        toast.error('Failed to load video');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleSubmitFeedback = async () => {
    if (!textFeedback.trim()) {
      toast.error('Please provide feedback');
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
          grade: parseInt(grade),
          strengths: strengths.split('\n').filter(s => s.trim()),
          improvements: improvements.split('\n').filter(i => i.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Feedback submitted successfully!');
      redirect('/admin/dashboard');
    } catch (error) {
      toast.error('Failed to submit feedback');
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
            <CardTitle>Loading Video...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Video Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Review Student Video</h1>
          <p className="text-lg text-muted-foreground">
            {video.studentName} - {video.exerciseTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <video
                  controls
                  className="w-full rounded-lg bg-black max-h-96"
                  src={video.blobUrl}
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Submitted: {new Date(video.submittedAt).toLocaleString()}</p>
                  <p>Student: {video.studentName}</p>
                  <p>Exercise: {video.exerciseTitle}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form */}
          <div className="space-y-6">
            <Tabs defaultValue="decision" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="decision">Decision</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>

              {/* Decision Tab */}
              <TabsContent value="decision" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={decision} onValueChange={(value: any) => setDecision(value)}>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-green-500/20 hover:bg-green-500/5 cursor-pointer">
                          <RadioGroupItem value="APPROVED" id="approved" />
                          <Label htmlFor="approved" className="cursor-pointer flex-1">
                            <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Video meets requirements
                            </p>
                          </Label>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-500/20 hover:bg-orange-500/5 cursor-pointer">
                          <RadioGroupItem value="REVISION_NEEDED" id="revision" />
                          <Label htmlFor="revision" className="cursor-pointer flex-1">
                            <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
                              <AlertCircle className="w-4 h-4" />
                              Revision Needed
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Send feedback, ask for resubmission
                            </p>
                          </Label>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg border border-red-500/20 hover:bg-red-500/5 cursor-pointer">
                          <RadioGroupItem value="REJECTED" id="rejected" />
                          <Label htmlFor="rejected" className="cursor-pointer flex-1">
                            <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Does not meet requirements
                            </p>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full"
                      />
                      <div className="text-3xl font-bold text-center text-primary">
                        {grade}/100
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Text Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="feedback">Feedback for Student</Label>
                      <Textarea
                        id="feedback"
                        value={textFeedback}
                        onChange={(e) => setTextFeedback(e.target.value)}
                        placeholder="Provide constructive feedback on the student's performance..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="strengths">What went well? (one per line)</Label>
                      <Textarea
                        id="strengths"
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        placeholder="Clear pronunciation&#10;Good confidence&#10;Natural intonation"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="improvements">What needs improvement? (one per line)</Label>
                      <Textarea
                        id="improvements"
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                        placeholder="Work on stress patterns&#10;Slow down a bit&#10;Practice vowel sounds"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting}
              size="lg"
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
