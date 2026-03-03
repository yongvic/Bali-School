'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Upload, Video, CheckCircle2 } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  mode: string;
}

export default function SubmitVideoPage() {
  const { data: session, status } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) throw new Error('Failed to fetch exercises');
        
        const data = await response.json();
        setExercises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchExercises();
    }
  }, [session?.user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExercise || !videoFile) {
      setError('Please select an exercise and video file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('exerciseId', selectedExercise);

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setVideoFile(null);
      setSelectedExercise(null);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Submit Video Exercise</h1>
          <p className="text-muted-foreground mt-1">Record and submit your English practice video</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Video</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Video submitted successfully! Your submission is now under review.
                  </p>
                </div>
              )}

              {/* Exercise Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">Select Exercise</label>
                {exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exercises available</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {exercises.map(exercise => (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => setSelectedExercise(exercise.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedExercise === exercise.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-semibold">{exercise.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exercise.mode}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">Upload Video</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-input"
                    disabled={uploading}
                  />
                  <label htmlFor="video-input" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      {videoFile ? (
                        <>
                          <CheckCircle2 className="w-12 h-12 text-green-500" />
                          <div>
                            <p className="font-semibold text-green-600 dark:text-green-400">{videoFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div>
                            <p className="font-semibold">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">MP4, WebM or MOV (Max 100MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!selectedExercise || !videoFile || uploading}
                className="w-full gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Submit Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🎤</span>
              <div>
                <p className="font-semibold text-sm">Clear Audio</p>
                <p className="text-sm text-muted-foreground">Record in a quiet environment</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🎬</span>
              <div>
                <p className="font-semibold text-sm">Good Lighting</p>
                <p className="text-sm text-muted-foreground">Make sure your face is well-lit</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">⏱️</span>
              <div>
                <p className="font-semibold text-sm">Appropriate Length</p>
                <p className="text-sm text-muted-foreground">Follow the exercise guidelines for duration</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">😊</span>
              <div>
                <p className="font-semibold text-sm">Be Confident</p>
                <p className="text-sm text-muted-foreground">Speak clearly and with natural pronunciation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
